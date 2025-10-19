"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import InvitationSection from "./InvitationSection";

export default function WeddingCover() {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpenInvitation = () => {
    setIsOpened(true);
  };

  return (
    <main className="fixed inset-0 bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {/* 💌 COVER SECTION */}
        {!isOpened && (
          <motion.section
            key="cover"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 flex justify-center items-center text-center text-white"
          >
            <div className="relative w-full max-w-md mx-auto h-full overflow-hidden bg-white">
              {/* 🖼️ Background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('/cover.JPG')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="absolute inset-0 bg-black/40" />

              {/* ✨ Text Content */}
              <div className="relative z-10 flex flex-col justify-center items-center h-full px-6">
                <h3 className="text-sm tracking-widest mb-2">THE WEDDING OF</h3>
                <h1 className="text-3xl md:text-4xl font-serif mb-4">
                  ADAM & PASANGAN
                </h1>
                <p className="text-sm mb-1">Kepada Yth.</p>
                <p className="text-sm mb-4">Bapak/Ibu/Saudara/i</p>
                <h2 className="text-xl font-semibold mb-6">Nama Tamu</h2>

                {/* 🎁 Tombol Buka Undangan */}
                <button
                  onClick={handleOpenInvitation}
                  className="bg-white text-gray-900 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                >
                  <FaEnvelope /> Buka Undangan
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* 🪩 INVITATION DETAIL */}
        {isOpened && (
          <motion.section
            key="invitation"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 bg-white overflow-y-auto"
          >
            {/* 🎶 Kirim prop biar musik mulai otomatis */}
            <InvitationSection autoPlayMusic />
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
