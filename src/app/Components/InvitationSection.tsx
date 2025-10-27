  "use client";
  import { Philosopher, Lora } from "next/font/google";
  import { useEffect, useState, useRef } from "react";
  import { getSupabaseClient } from "@/app/lib/supabaseClient";
  import { FaInstagram } from "react-icons/fa";
  import "yet-another-react-lightbox/styles.css";
  import Lightbox from "yet-another-react-lightbox";
  import { motion } from "framer-motion";
  import { FaMusic } from "react-icons/fa";


  // import font philosopher
  const philosopher = Philosopher({
    subsets: ["latin"],
    weight: ["400", "700"],
  });

  // import font lora
  const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "700"],
  });

  // 🚀 Supabase Client
  const supabase = getSupabaseClient();

  export default function InvitationDetailSection({ autoPlayMusic = false }: { autoPlayMusic?: boolean }) {
      // 🎶 Musik State
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ▶️ Auto play saat buka undangan
    useEffect(() => {
      const audio = audioRef.current;
      if (audio) {
        // mulai dengan fade-in volume
        audio.volume = 0;
        audio.play().catch(() => console.log("Autoplay diblokir"));
        setIsPlaying(true);

        let vol = 0;
        const fade = setInterval(() => {
          if (audio.volume < 1) {
            vol += 0.05;
            audio.volume = Math.min(vol, 1);
          } else clearInterval(fade);
        }, 100);
      }
    }, []);

    const toggleMusic = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) audio.pause();
      else audio.play();
      setIsPlaying(!isPlaying);
    };

    

    const images = ["/section1.webp", "/section1_2.webp", "/section1_3.webp" ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const parallaxRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // ganti setiap 4 detik
    return () => clearInterval(interval);
  }, [images.length]);

    // Efek Parallax saat scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const background = parallaxRef.current;

      if (background) {
        background.style.transform = `translateY(${scrollPosition * 0.5}px)`; // Sesuaikan faktor parallax
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    const [showGift, setShowGift] = useState(false);
    const [copiedText, setCopiedText] = useState("");
    const [formData, setFormData] = useState({
    name: "",
    message: "",
    attendance: "",
  });
    interface Wish {
    id: string;
    name: string;
    message: string;
    attendance: string;
    created_at?: string;
  }

  const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(false);
    const verseRef = useRef<HTMLDivElement>(null);
    const brideRef = useRef<HTMLDivElement>(null);
    const groomRef = useRef<HTMLDivElement>(null);


    // 🧠 Ambil ucapan awal dari Supabase
  const fetchWishes = async () => {
    if (!supabase) return; // <--- tambahkan ini
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setWishes(data);
  };


  // 🧠 Ambil data awal & pantau realtime
  useEffect(() => {
    if (!supabase) return;

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from("wishes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setWishes(data);
    };

    loadInitial();

    // ✅ Gunakan nama channel custom, bukan "public:wishes"
    const channel = supabase
      .channel("wishes-realtime-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wishes" },
        (payload) => {
          console.log("✅ Realtime payload diterima:", payload.new);
          setWishes((prev) => [payload.new as Wish, ...prev]);
        }
      )
      .subscribe((status) => {
        console.log("📡 Channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);




    // ✍️ Kirim ucapan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    const { name, message, attendance } = formData;
    if (!name || !message || !attendance) {
      alert("Lengkapi semua kolom!");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("wishes")
      .insert([{ name, message, attendance }]);

    if (error) {
      alert("Gagal mengirim ucapan 😢");
      console.error(error);
    } else {
      // biarkan realtime listener yang update daftar
      setFormData({ name: "", message: "", attendance: "" });
    }

    setLoading(false);
  };





    // ✨ Efek fade-in saat scroll
    useEffect(() => {
      const elements = [verseRef.current, brideRef.current, groomRef.current];
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting)
              entry.target.classList.add("opacity-100", "translate-y-0");
          });
        },
        { threshold: 0.2 }
      );
      elements.forEach((el) => el && observer.observe(el));
      return () => observer.disconnect();
    }, []);

    // 📸 Lightbox Gallery State
    const [open, setOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const galleryImages = [
      "/gallery1.JPG",
      "/gallery2.JPG",
      "/gallery3.JPG",
      "/gallery4.JPG",
      "/gallery5.JPG",
      "/gallery11.JPG",
      "/gallery7.JPG",
      "/gallery8.JPG",
      "/gallery9.JPG",
      "/gallery10.JPG",
    ];

    const thankImages = ["/thanks1.JPG", "/thanks2.JPG", "/thanks3.JPG", "/thanks4.JPG"];
    const [currentThankIndex, setCurrentThankIndex] = useState(0);

    useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThankIndex((prev) => (prev + 1) % thankImages.length);
    }, 4000); // ganti tiap 4 detik
    return () => clearInterval(interval);
  }, []);

    

    // ⏳ Countdown Component
    function Countdown({ targetDate }: { targetDate: string }) {
      const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }

        return timeLeft;
      };

      const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

      useEffect(() => {
        const timer = setInterval(() => {
          setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
      }, []);



      
      return (
        <div className="flex justify-center gap-4 mb-6 text-center">
          <div>
            <p className="text-3xl font-bold">{timeLeft.days}</p>
            <p className="text-xs tracking-wider">Hari</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{timeLeft.hours}</p>
            <p className="text-xs tracking-wider">Jam</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{timeLeft.minutes}</p>
            <p className="text-xs tracking-wider">Menit</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{timeLeft.seconds}</p>
            <p className="text-xs tracking-wider">Detik</p>
          </div>
        </div>
      );
    }

    // 🧩 MAIN RETURN
    return (
      <section className="min-h-screen w-full bg-[#f9f3eb] flex flex-col items-center">
        {/* 🎵 Audio Player */}
        <audio ref={audioRef} loop src="/music.mp3" />

        {/* 🎵 Tombol Musik */}
        <button
          onClick={toggleMusic}
          className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-md transition ${
            isPlaying
              ? "bg-green-600 hover:bg-green-500"
              : "bg-gray-800 hover:bg-gray-700"
          } text-white`}
        >
          <FaMusic className={isPlaying ? "animate-pulse" : ""} />
        </button>
        <div className="relative w-full max-w-md bg-[#f9f3eb] shadow-md overflow-hidden">
          {/* 🖼️ Slideshow Cover */}
          <div className="relative h-screen flex justify-center items-center">
            {images.map((src, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}

            <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-b from-transparent via-[#99a1af]/60 to-[#f9f3eb]" />
            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute bottom-[20vh] left-6 z-10 text-left text-white drop-shadow-md">
              <h3 className={`${lora.className} text-xl tracking-[0.2em] mb-1`}>THE WEDDING OF</h3>
              <h1 className={`${philosopher.className} text-2xl md:text-5xl font-serif font-semibold mb-1`}>
                ADAM & TASSYA
              </h1>
              <p className={`${lora.className} text-xl text-white/90 font-light`}>
                Sabtu, 06 Desember 2025
              </p>
            </div>
          </div>

          {/* ✝️ Verse Section */}
          <div
            ref={verseRef}
            className="opacity-0 translate-y-6 transition-all duration-700 ease-out flex flex-col justify-center items-center text-center py-24 px-6 bg-transparent -mt-10 relative z-10"
          >
            <div className="flex items-center justify-center space-x-6 mb-4">
              <span className={`${philosopher.className} text-4xl font-serif font-medium text-[#333]`}>A</span>
              <div className="w-px h-8 bg-gray-400" />
              <span className={`${philosopher.className} text-4xl font-serif font-medium text-[#333]`}>T</span>
            </div>
            <h3 className={`${philosopher.className} text-xl italic text-gray-700 mb-2 mt-4`}>Ar-Rum : 21</h3>
            <p className={`${lora.className} max-w-xs text-sm leading-relaxed text-gray-600`}>
              "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, agar kamu merasa tenteram dengan mereka, dan Dia jadikan di antara kamu rasa kasih sayang dan rahmat."
            </p>
          </div>

          {/* 👰 Bride Section */}
          <motion.div
            className="flex justify-end items-center mb-24 bg-transparent pb-14 px-0 relative"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 rotate-[-90deg] origin-left left-[6rem] sm:left-[1rem] md:left-[9rem]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className={`${philosopher.className} text-gray-600 italic text-2xl sm:text-3xl md:text-4xl tracking-wide font-serif`}>
                The Bride
              </h2>
            </motion.div>

            <motion.div
              className="flex flex-col items-end mr-2 relative"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="absolute -left-2 top-2 w-64 h-[380px] bg-[#b9a999] rounded-md"></div>
              <motion.img
                src="/bride.jpeg"
                alt="The Bride"
                className="relative w-64 h-[380px] object-cover rounded-md shadow-lg"
                initial={{ opacity: 0, x: 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
              <motion.div
                className="mt-6 pr-1 text-right"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <h3 className={`${philosopher.className} font-serif text-lg text-gray-700 font-semibold`}>
                  Tassya Madanya Islamy
                </h3>
                <p className={`${lora.className} text-sm text-gray-500 max-w-[240px] italic`}>
                  Putri dari Bapak <span className="font-bold">Achmad Zarkasih</span> & Ibu <span className="font-bold">Elin Yuniar</span>
                </p>

                {/* Instagram Button */}
                <a
                  href="https://www.instagram.com/tassa_07?igsh=NTJtbHk1MGltZ3pw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-[#E4405F] text-white py-2 px-4 rounded-xl font-medium hover:bg-[#b53948] transition"
                >
                  <FaInstagram className="text-white text-lg" />
                  tassa_07
                </a>
              </motion.div>
            </motion.div>
          </motion.div>



          {/* 🤵 Groom Section */}
          <motion.div
            className="flex justify-start items-center mb-28 bg-transparent pb-16 px-0 relative"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="absolute right-[6rem] sm:right-[1rem] md:right-[9rem] top-1/2 -translate-y-1/2 rotate-[90deg] origin-right"
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className={`${philosopher.className} text-gray-600 italic text-2xl sm:text-3xl md:text-4xl tracking-wide font-serif`}>
                The Groom
              </h2>
            </motion.div>

            <motion.div
              className="flex flex-col items-start ml-2 relative"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="absolute left-2 top-2 w-64 h-[380px] bg-[#b9a999] rounded-md"></div>
              <motion.img
                src="/groom.jpeg"
                alt="The Groom"
                className="relative w-64 h-[380px] object-cover rounded-md shadow-lg"
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
              <motion.div
                className="mt-6 pl-1 text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <h3 className={`${philosopher.className} font-serif text-lg text-gray-700 font-semibold`}>
                  Muhammad Bustamil Adam
                </h3>
                <p className={`${lora.className} text-sm text-gray-500 max-w-[240px] italic`}>
                  Putra dari Bapak <span className="font-bold">Suherman</span> & Ibu <span className="font-bold">Nurjanah</span>
                </p>

                {/* Instagram Button */}
                  <a
                    href="https://www.instagram.com/bustalime_13?igsh=MWprNmc3aDNiNGM3Yg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-[#E4405F] text-white py-2 px-4 rounded-xl font-medium hover:bg-[#b53948] transition"
                  >
                    <FaInstagram className="text-white text-lg" />
                    bustalime_13
                  </a>
              </motion.div>
            </motion.div>
          </motion.div>


          {/* 💍 Countdown Section */}
          <motion.div
            className="relative w-full min-h-[140vh] flex flex-col items-center justify-start text-center overflow-hidden"
            style={{
              backgroundImage: "url('/thanks4.JPG')",
              backgroundAttachment: "fixed",
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 z-0" />

            {/* Card Content */}
            <motion.div
              className="relative z-10 w-[90%] max-w-md mx-auto text-white shadow-xl backdrop-blur-sm overflow-hidden pb-10 mt-16"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                clipPath: "path('M 0 100 Q 200 0 400 100 L 400 600 L 0 600 Z')",
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="flex flex-col items-center px-6 pt-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.3, // Animasi berurutan
                    },
                  },
                }}
              >
                <motion.img
                  src="/flower.png"
                  alt="flower"
                  className="w-20 h-auto mb-4 opacity-90"
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                  }}
                />

                <motion.h3
                  className={`${lora.className} text-sm tracking-[0.25em] mb-1 font-light`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                  }}
                >
                  Hitung Mundur
                </motion.h3>

                <motion.h1
                  className={`${philosopher.className} text-lg font-serif font-semibold mb-5`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                  }}
                >
                  Hari Bahagia Kami
                </motion.h1>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                  }}
                >
                  <Countdown targetDate="2025-12-06T12:00:00" />
                </motion.div>

                <motion.p
                  className={`${lora.className} text-sm text-white/90 leading-relaxed px-4`}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
                  }}
                >
                  Bergabunglah dengan kami untuk menyaksikan dan merayakan
                  terbentuknya ikatan suci ini. Kami berharap Anda menjadi bagian
                  di hari istimewa kami.
                </motion.p>
              </motion.div>
            </motion.div>

            {/* 🎥 Live Streaming Section */}
            <motion.div
              className="relative z-10 w-[90%] max-w-md mx-auto text-white mt-10 mb-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            >
              <div className={`${philosopher.className} bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-8`}>
                <motion.h2
                  className="text-lg font-serif font-semibold mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  Live Streaming
                </motion.h2>
                <motion.p
                  className="text-sm text-white/90 leading-relaxed mb-5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Temui kami secara virtual untuk menyaksikan acara pernikahan kami
                  melalui sosial media kami:
                </motion.p>
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  <a
                    href="https://www.instagram.com/tassa_07?igsh=NTJtbHk1MGltZ3pw"
                    target="_blank"
                    className="w-full bg-white text-gray-800 py-2 rounded-full font-medium hover:bg-gray-200 transition flex justify-center items-center gap-2"
                  >
                    <FaInstagram className="text-gray-700 text-lg" />
                    Tassya Madanya Islamy
                  </a>
                  <a
                    href="https://www.instagram.com/bustalime_13?igsh=MWprNmc3aDNiNGM3Yg=="
                    target="_blank"
                    className="w-full bg-white text-gray-800 py-2 rounded-full font-medium hover:bg-gray-200 transition flex justify-center items-center gap-2"
                  >
                    <FaInstagram className="text-gray-700 text-lg" />
                    Muhammad Bustamil Adam
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* 💒 Wedding Event Section */}
          <motion.div
            className="relative w-full flex justify-center items-center bg-[#efe7dd] py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-md bg-[#efe7dd] text-[#3a2e2e] flex overflow-hidden rounded-md">
              {/* 🟫 Panel kiri (pembatas vertikal penuh) */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#7b6652] w-[65px] flex items-center justify-center z-10"
              >
                <p className="rotate-[-90deg] text-white text-[12px] font-serif tracking-[0.2em] whitespace-nowrap">
                  Wedding Event
                </p>
              </div>

              {/* 📸 Konten kanan */}
              <div className="ml-[65px] flex-1 flex flex-col">
                {/* 🖼️ Akad Nikah */}
                <motion.div
                  className="relative w-full overflow-hidden"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                >
                  <img
                    src="/akad.jpg"
                    alt="Akad Nikah"
                    className="w-full h-[300px] object-cover"
                    style={{
                      borderTopLeftRadius: "0px",
                      borderTopRightRadius: "120px",
                      borderBottomRightRadius: "0px",
                      borderBottomLeftRadius: "0px",
                    }}
                  />
                </motion.div>

                {/* 🕊️ Detail Akad */}
                <motion.div
                  className="text-left px-8 mt-6 pb-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.2 } },
                  }}
                >
                  {[
                    { text: "Akad Nikah", className: `${philosopher.className} text-xl font-serif italic font-bold mb-2` },
                    { text: "Sabtu, 06 Desember 2025", className: `${lora.className} text-sm mb-1` },
                    { divider: true },
                    { text: "12.00 WIB s/d Selesai", className: `${lora.className} text-sm mb-3` },
                    { text: "Lokasi Acara", className: `${philosopher.className} text-xl font-bold mb-1` },
                    { text: "Jl Prumpung Tengah | Rt.10/Rw.06, Cipinang Besar Utara, Jatinegara, Jakarta Timur", className: `${lora.className} text-sm leading-relaxed mb-6` },
                  ].map((item, idx) =>
                    item.divider ? (
                      <motion.div
                        key={idx}
                        className="w-[60%] border-b border-[#7a6f63]"
                        variants={{
                          hidden: { opacity: 0, scaleX: 0 },
                          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.4 } },
                        }}
                      />
                    ) : (
                      <motion.p
                        key={idx}
                        className={item.className}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                        }}
                      >
                        {item.text}
                      </motion.p>
                    )
                  )}

                  {/* 📍 Tombol Buka Maps */}
                  <motion.a
                    href="https://maps.app.goo.gl/5LK2S2qrKenYjfQh7"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#3a2e2e] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#5a4949] transition"
                    whileTap={{ scale: 0.97 }}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  >
                    <span>📍</span>
                    <span>BUKA MAPS</span>
                  </motion.a>
                </motion.div>

                {/* ✨ Pemisah lembut antar bagian */}
                <motion.div
                  className="h-[2px] bg-gradient-to-r from-transparent via-[#d2c7ba] to-transparent mb-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                ></motion.div>

                {/* 🖼️ Resepsi */}
                <motion.div
                  className="relative w-full overflow-hidden"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <img
                    src="/resepsi.JPG"
                    alt="Resepsi"
                    className="w-full h-[400px] object-cover object-center"
                    style={{
                      borderTopLeftRadius: "120px",
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                      borderBottomLeftRadius: "0px",
                    }}
                  />
                </motion.div>

                {/* 🕊️ Detail Resepsi */}
                <motion.div
                  className="text-right px-8 mt-6 pb-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.2 } },
                  }}
                >
                  {[
                    { text: "Resepsi", className: `${philosopher.className} text-xl font-serif italic font-bold mb-2` },
                    { text: "Sabtu, 06 Desember 2025", className: `${lora.className} text-sm mb-1` },
                    { divider: true },
                    { text: "12.00 WIB s/d Selesai", className: `${lora.className} text-sm mb-3` },
                    { text: "Lokasi Acara", className: `${philosopher.className} text-xl font-bold mb-1` },
                    { text: "Jl Prumpung Tengah | Rt.10/Rw.06, Cipinang Besar Utara, Jatinegara, Jakarta Timur", className: `${lora.className} text-sm leading-relaxed mb-6` },
                  ].map((item, idx) =>
                    item.divider ? (
                      <motion.div
                        key={idx}
                        className="w-[60%] ml-auto border-b border-[#7a6f63]"
                        variants={{
                          hidden: { opacity: 0, scaleX: 0 },
                          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.4 } },
                        }}
                      />
                    ) : (
                      <motion.p
                        key={idx}
                        className={item.className}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                        }}
                      >
                        {item.text}
                      </motion.p>
                    )
                  )}

                  {/* 📍 Tombol Buka Maps */}
                  <motion.a
                    href="https://maps.app.goo.gl/AVMzorDj4sbPP6iE6"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#3a2e2e] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#5a4949] transition"
                    whileTap={{ scale: 0.97 }}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  >
                    <span>📍</span>
                    <span>BUKA MAPS</span>
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </motion.div>


          {/* 🌸 Our Journey Section */}
          <motion.div
            className="relative w-full h-full overflow-hidden flex items-center justify-center text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >

            {/* 🔹 Parallax background pakai <motion.div> dan bukan <motion.img> */}
          <motion.div
        ref={parallaxRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // Parallax effect
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

            {/* 🔹 Overlay hitam transparan */}
            <motion.div
              className="absolute inset-0 bg-black/65"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.65 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            ></motion.div>

            {/* 🔹 Konten Tengah */}
            <motion.div
              className="relative z-10 text-center px-6 max-w-md mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.3 } },
              }}
            >
              {/* 🖐️ Icon tangan */}
              <motion.img
                src="/hands.png"
                alt="Flower Hand"
                className="w-14 mb-6 opacity-90 mx-auto"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                }}
              />

              {/* 🏷️ Judul */}
              <motion.h2
                className={`${philosopher.className} text-2xl font-serif font-semibold mb-10 tracking-wide`}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
                }}
              >
                Our Journey
              </motion.h2>

              {/* 📜 Cerita perjalanan */}
              <motion.div
                className="space-y-8 text-sm leading-relaxed"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.4 } },
                }}
              >
                {[
                  {
                    title: "Awal Bertemu (Hanya di Instagram)",
                    text: `Semua bermula di Instagram. Setelah saling follow, Adam memberanikan diri mengirim pesan kepada Tassya. Dari sekadar chatting ringan, obrolan kami segera berkembang menjadi intens dan penuh tawa.`,
                  },
                  {
                    title: "Pisang Cebanan dan First Date",
                    text: `Kedekatan kami semakin terjalin ketika Adam memesan Pisang Cebanan yang Tassya jual. Momen chatting dan transaksi inilah yang memicu keinginan kami untuk bertemu lagi. First Date kami adalah berjalan-jalan seru di salah satu Mall di Jakarta dan dilanjutkan dengan bermain Bowling! Momen ini menjadi penanda strike pertama cinta kami.`,
                  },
                  {
                    title: "Menjalin Kasih",
                    text: `Dari first date yang seru, kami menyadari adanya kecocokan luar biasa. Kami pun mantap untuk menjalin kasih dan memulai babak baru sebagai sepasang kekasih. Hari, bulan, bahkan tahun pun kami lalui bersama, saling mendukung, bertumbuh, dan menguji keyakinan satu sama lain.`,
                  },
                  {
                    title: "Memantapkan Hati (6 Juli 2025)",
                    text: `Setelah melewati masa pacaran yang penuh makna, Adam memantapkan hati untuk membawa hubungan ini ke jenjang serius. Tepat pada tanggal 6 Juli 2025, momen lamaran yang mengharukan diselenggarakan, menjadi penanda bahwa hati kami telah bersepakat untuk saling melengkapi selamanya.`,
                  },
                  {
                    title: "Janji Suci: Selamanya Milik Kita",
                    text: `dengan penuh rasa syukur dan bahagia, kami siap mengukir babak baru. Kisah yang bermula dari DM Instagram, kelezatan Pisang Cebanan, dan keseruan date di Mall Jakarta, kini berlabuh di ikatan suci pernikahan.
Mohon doa restu dari Bapak/Ibu/Saudara/i sekalian, agar pernikahan Adam & Tassya menjadi langkah awal menuju keluarga yang Sakinah, Mawaddah, Warahmah.
Adam & Tassya`,
                  },
                ].map((story, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.8, ease: "easeOut" },
                      },
                    }}
                  >
                    <h3 className={`${lora.className} text-base font-serif italic mb-1`}>{story.title}</h3>
                    <p className={`${lora.className} text-gray-100 whitespace-pre-line mb-10`}>{story.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* 📸 Our Gallery Section */}
          <motion.div
            className="w-full bg-[#efe7dd] py-20 flex flex-col items-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Judul */}
            <motion.h2
              className={`${philosopher.className} text-2xl font-serif italic text-[#3a2e2e] mb-10`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Our Gallery
            </motion.h2>

            {/* Grid Foto */}
            <div className="grid grid-cols-2 gap-3 px-4 w-full max-w-3xl">
              {galleryImages.map((src, i) => {
                const isFirst = i === 0;
                const isLast = i === galleryImages.length - 1;
                const isFull = isFirst || isLast;

                return (
                  <motion.div
                    key={i}
                    onClick={() => {
                      setPhotoIndex(i);
                      setOpen(true);
                    }}
                    // 🔹 Kalau foto pertama / terakhir → full width (col-span-2)
                    className={`cursor-pointer overflow-hidden rounded-xl shadow-md transition-transform hover:scale-[1.03] ${
                      isFull ? "col-span-2" : "col-span-1"
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    <img
                      src={src}
                      alt={`Gallery ${i + 1}`}
                      className={`w-full h-auto object-contain rounded-xl ${
                        isFull ? "max-h-[400px]" : "max-h-[300px]"
                      }`}
                      loading="lazy"
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* 💡 Lightbox */}
            {open && (
              <Lightbox
                key="gallery-lightbox"
                open={open}
                close={() => setOpen(false)}
                index={photoIndex}
                slides={galleryImages.map((src) => ({ src }))}
                animation={{ fade: 400, swipe: 300 }}
                controller={{ closeOnBackdropClick: true }}
                on={{ view: ({ index }) => setPhotoIndex(index) }}
              />
            )}
          </motion.div>


          {/* 🎁 Wedding Gift Section */}
          <motion.div
            className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
          
          {/* 🔹 Parallax background pakai <motion.div> dan bukan <motion.img> */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              backgroundSize: "contain",
              backgroundPosition: "center top",
              backgroundAttachment: "fixed",  // Parallax effect
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* 🎁 Content Card */}
            <motion.div
              className="relative z-10 w-[85%] max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-10 text-center shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h2
                className={`${philosopher.className} text-2xl font-serif italic mb-4 text-white`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Wedding Gift
              </motion.h2>

              <motion.p
                className={`${lora.className} text-sm text-gray-100 leading-relaxed mb-6`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Tanpa mengurangi rasa hormat, bagi anda yang ingin memberikan tanda kasih
                untuk kami, dapat melalui:
              </motion.p>

              {/* 🎁 Tombol */}
              <motion.button
                onClick={() => setShowGift((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 transition cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                <span>🎁</span>
                <motion.span
                  key={showGift ? "hide" : "show"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {showGift ? "SEMBUNYIKAN" : "KLIK DISINI"}
                </motion.span>
              </motion.button>

              {/* 🧾 Konten Gift (Expand) */}
              <motion.div
                initial={false}
                animate={{
                  height: showGift ? "auto" : 0,
                  opacity: showGift ? 1 : 0,
                  marginTop: showGift ? 40 : 0,
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {/* 💳 Kartu 1 */}
                <motion.div
                  className="bg-white/90 rounded-xl shadow-lg p-4 mb-5 border border-gray-200"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: showGift ? 1 : 0, y: showGift ? 0 : 30 }}
                  transition={{ duration: 0.7, delay: showGift ? 0.2 : 0 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className={`${lora.className} font-medium text-gray-800`}>a.n Muhammad Bustamil Adam</p>
                      <p className={`${lora.className} text-sm text-gray-600`}>0760214639</p>
                    </div>
                    <img src="/bca.png" alt="BCA" className="w-12 h-auto" />
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("12345678");
                      setCopiedText("Nomor rekening disalin!");
                      setTimeout(() => setCopiedText(""), 2000);
                    }}
                    className={`${lora.className} w-full bg-gray-800 text-white py-2 text-sm rounded-md hover:bg-gray-700 transition flex justify-center items-center gap-2`}
                  >
                    Salin Nomor 📋
                  </button>
                  {copiedText && (
                    <p className="text-black text-sm mt-3 animate-fadeIn">{copiedText}</p>
                  )}
                </motion.div>

                {/* 💳 Kartu 2 */}
                <motion.div
                  className="bg-white/90 rounded-xl shadow-lg p-4 mb-5 border border-gray-200"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: showGift ? 1 : 0, y: showGift ? 0 : 30 }}
                  transition={{ duration: 0.7, delay: showGift ? 0.4 : 0 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className={`${lora.className} font-medium text-gray-800`}>a.n Tassya Madanya Islamy</p>
                      <p className={`${lora.className} text-sm text-gray-600`}>4960459461</p>
                    </div>
                    <img src="/bca.png" alt="BCA" className="w-12 h-auto" />
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("12345678");
                      setCopiedText("Nomor rekening disalin!");
                      setTimeout(() => setCopiedText(""), 2000);
                    }}
                    className={`${lora.className} w-full bg-gray-800 text-white py-2 text-sm rounded-md hover:bg-gray-700 transition flex justify-center items-center gap-2`}
                  >
                    Salin Nomor 📋
                  </button>
                  {copiedText && (
                    <p className="text-black text-sm mt-3 animate-fadeIn">{copiedText}</p>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>


          {/* 💌 Realtime Ucapan & Doa */}
          <motion.div
            className="w-full bg-[#ADD8E6] py-16 flex flex-col items-center text-center text-[#3a2e2e]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            {/* 🖼️ Kartu Form */}
            <motion.div
              className="w-[85%] max-w-md bg-[#f7f1eb] rounded-[2rem] shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="w-full h-[220px] overflow-hidden"
                initial={{ scale: 1.1, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <img
                  src="/wishlist.JPG"
                  alt="Couple Photo"
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>

              <div className="p-6 text-left">
                <motion.h2
                  className={`${philosopher.className} text-center text-xl font-serif italic mb-6`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  Berikan Ucapan & Doa
                </motion.h2>

                {/* ✍️ Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.15 } },
                  }}
                >
                  <motion.input
                    type="text"
                    placeholder="Nama"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                    required
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  />
                  <motion.textarea
                    placeholder="Ucapan"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none resize-none h-24"
                    required
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  />
                  <motion.select
                    value={formData.attendance}
                    onChange={(e) =>
                      setFormData({ ...formData, attendance: e.target.value })
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                    required
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  >
                    <option value="">Konfirmasi Kehadiran</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </motion.select>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="bg-[#3a2e2e] text-white py-2 rounded-md text-sm font-medium hover:bg-[#5a4949] transition"
                    whileTap={{ scale: 0.97 }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  >
                    {loading ? "Mengirim..." : "➤ Kirim"}
                  </motion.button>
                </motion.form>
              </div>
            </motion.div>

            {/* 💬 Daftar Ucapan */}
            <motion.div
              className="w-[85%] max-w-md mt-10 bg-[#f7f1eb] rounded-2xl p-5 shadow-inner text-left max-h-[400px] overflow-y-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.h3
                className="text-sm font-medium mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {wishes.length} Ucapan
              </motion.h3>

              {wishes.length === 0 ? (
                <motion.p
                  className="text-sm text-gray-500 italic text-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  Belum ada ucapan 💌
                </motion.p>
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.15 } },
                  }}
                >
                  {wishes.map((wish) => (
                    <motion.div
                      key={wish.id}
                      className="border-b border-gray-300 pb-3 mb-3"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5, ease: "easeOut" },
                        },
                      }}
                    >
                      <p className="font-medium text-gray-700">{wish.name}</p>
                      <p className="text-sm text-gray-600">{wish.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {wish.attendance === "Hadir"
                          ? "💒 Akan Hadir"
                          : "💐 Tidak Hadir"}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>


          {/* 🌸 Section Terima Kasih */}
          <motion.div
            className="relative w-full h-screen flex flex-col justify-center items-center text-center overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >

          {/* 🔹 Parallax background pakai <motion.div> dan bukan <motion.img> */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              backgroundSize: "contain",
              backgroundPosition: "center top",
              backgroundAttachment: "fixed",  // Parallax effect
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

            {/* 🌙 Overlay biar teks tetap terbaca */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(68, 52, 38, 0.85) 0%, rgba(96, 78, 60, 0.65) 40%, rgba(124, 104, 84, 0.35) 70%, transparent 100%)",
              }}
            ></div>

            {/* 💬 Konten teks */}
            <motion.div
              className="relative z-10 px-6 max-w-sm text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.3 } },
              }}
            >
              <motion.h2
                className={`${lora.className} text-2xl font-serif mb-3`}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                }}
              >
                Terima Kasih
              </motion.h2>

              <motion.p
                className={`${lora.className} text-sm leading-relaxed text-gray-100 mb-6`}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                }}
              >
                Merupakan suatu kebahagiaan dan kehormatan bagi kami,
                apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan
                doa restu kepada kami.
              </motion.p>

              <motion.p
                className={`${philosopher.className} font-serif text-lg`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                }}
              >
                Adam & Tassya
              </motion.p>
            </motion.div>
          </motion.div>

        </div>
      </section>
    );
  }
