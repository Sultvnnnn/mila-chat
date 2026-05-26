import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import * as qrcode from "qrcode-terminal";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

//! init environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

//! init supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

//! chat history
const chatHistory = new Map<string, any[]>();
const processedAdminMessages = new Set<string>();

async function connectToWhatsApp() {
  /*
      Fungsi ini akan menyimpan sesi login secara lokal di folder 'auth_info_baileys'
      Jadi gak perlu scan QR berkali-kali setiap kali restart server.
  */

  const { state, saveCreds } = await useMultiFileAuthState(
    "./auth_info_baileys",
  );

  //! init socket whatsapp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
  });

  //! handle connection update
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(
        "\n[SYSTEM] Please scan the QR code below with your WhatsApp device to authenticate.\n",
      );
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        `[SYSTEM] Connection closed. Attempting to reconnect: ${shouldReconnect}`,
      );

      //? auto reconnect jika bukan karena logout
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        console.log(
          "[SYSTEM] Session terminated. Please delete the auth_info_baileys directory and scan the QR again.",
        );
      }
    } else if (connection === "open") {
      console.log("\n[SYSTEM] Successfully connected to WhatsApp server!\n");
    }
  });

  //! save credentials when they are updated
  sock.ev.on("creds.update", saveCreds);

  //! SUPABASE REAL-TIME: Receive Admin Replies from the Dashboard
  supabaseClient
    .channel("wa-admin-replies")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
        filter: "channel=eq.whatsapp",
      },
      async (payload) => {
        const newData = payload.new as any;
        const messages = newData.messages;
        const lastMsg = messages[messages.length - 1];

        //? Jika pesan terakhir dari Admin dan bukan state temporary
        if (lastMsg && lastMsg.isAdmin && !lastMsg.isSendingTemp) {
          if (!processedAdminMessages.has(lastMsg.id)) {
            processedAdminMessages.add(lastMsg.id);

            //? Ekstrak nomor tujuan (buang prefix "wa-")
            const targetNumber = newData.id.replace("wa-", "");

            try {
              //? Tembak pesan admin ke WA User
              await sock.sendMessage(targetNumber, { text: lastMsg.content });
              console.log(
                `\n[ADMIN DASHBOARD] Successfully sent admin message to: ${targetNumber}`,
              );

              //? Update memori lokal AI
              let history = chatHistory.get(targetNumber) || [];
              history.push({
                role: "assistant",
                content: lastMsg.content,
                isAdmin: true,
              });
              chatHistory.set(targetNumber, history);
            } catch (err) {
              console.error(
                "\n[ADMIN DASHBOARD ERROR] Failed to send message via WhatsApp:",
                err,
              );
            }
          }
        }
      },
    )
    .subscribe();

  //! listen for incoming messages
  sock.ev.on("messages.upsert", async (m) => {
    if (m.type !== "notify") return;

    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    //? mengekstrak teks dari pesan biasa atau pesan yang di-reply/diteruskan
    const messageBody =
      msg.message.conversation || msg.message.extendedTextMessage?.text;

    //? ekstrak nama dan nomor sender
    const rawSender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = rawSender
      ? jidNormalizedUser(rawSender)
      : msg.key.remoteJid;
    const pushName = msg.pushName || "Pengguna WhatsApp";

    if (messageBody) {
      console.log(
        `[INCOMING MESSAGE] Sender: ${pushName} (${senderNumber}) | Message: ${messageBody}`,
      );

      //? get history chat untuk sender ini, kalau belum ada buat array baru
      let history = chatHistory.get(senderNumber!) || [];
      history.push({ role: "user", content: messageBody }); //? simpan message user ke history

      if (history.length > 10) {
        history = history.slice(history.length - 10); //? limit history hanya 10 pesan terakhir
      }

      try {
        //? throw message to API
        const response = await fetch("http://localhost:3000/api/whatsapp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: senderNumber,
            pushName: pushName,
            messages: history,
          }),
        });

        const data = await response.json();

        /*
            !=== (ESKALASI ADMIN) ===
        */
        if (data.handledByAdmin) {
          console.log(
            `[SYSTEM] User ${senderNumber} is being handled by human admin. Bot is muted.`,
          );
          // Berhenti di sini, biarkan history tersimpan di memory tanpa membalas chat
          chatHistory.set(senderNumber!, history);
          return;
        }

        /*
            !=== (AI REPLY) ===
        */
        if (data.reply) {
          history.push({ role: "assistant", content: data.reply }); //? simpan response AI ke history
          chatHistory.set(senderNumber!, history); //? save update history ke dalam memory

          await sock.sendMessage(senderNumber!, { text: data.reply });
          console.log(
            `[SYSTEM] Successfully forwarded the API response to ${senderNumber}`,
          );
        }
      } catch (error) {
        console.error(
          "\n[CRITICAL ERROR] Failed to establish connection with the Next.js API. Is the server running?",
          error,
        );

        //? tell user kalau server lagi down
        await sock.sendMessage(senderNumber!, {
          text: "[ERROR] Unable to reach the main core server. Please try again later.",
        });
      }
    }
  });
}

connectToWhatsApp().catch((err) =>
  console.error(
    "\n[CRITICAL ERROR] Failed to start WhatsApp bot service:",
    err,
  ),
);
