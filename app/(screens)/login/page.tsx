// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { loginUser } from "@/lib/helpers/loginUser";
// import toast from "react-hot-toast";
// import { Icon } from "@iconify/react";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [current, setCurrent] = useState(0);

//   type Slide = {
//     heading: string;
//     para: string;
//     image: string;
//   };

//   const slides: Slide[] = [
//     {
//       heading: "Welcome to Tekton Campus",
//       para: "Your trusted partner in digital solutions.",
//       image: "/Group 2774.png",
//     },
//     {
//       heading: "Secure & Modern",
//       para: "Cutting-edge tools for your workflow.",
//       image: "/Group 2774 (1).png",
//     },
//     {
//       heading: "Grow Faster",
//       para: "Boost your productivity with us.",
//       image: "/Group 2774 (2).png",
//     },
//     {
//       heading: "Future Ready",
//       para: "Designed for performance and reliability.",
//       image: "/Group 2774 (3).png",
//     },
//     {
//       heading: "Leading Campus Operations Efficiently",
//       para: "Oversee academic activities, departments, and student management across the institution.",
//       image: "/home.png",
//     },
//     {
//       heading: "Managing Institutional Finances with Precision",
//       para: "Handle fee structures, payments, financial records, and reports seamlessly.",
//       image: "/Group 0021 (6).png",
//     },
//     {
//       heading: "Shaping Student Careers and Opportunities",
//       para: "Coordinate placement drives, track student progress, and connect with top recruiters.",
//       image: "/Placement Home.png",
//     },
//     {
//       heading: "Building Strong Teams for Better Education",
//       para: "Manage recruitment, staff records, payroll, and employee performance efficiently.",
//       image: "/HR home.png",
//     },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % slides.length);
//     }, 2500);
//     return () => clearInterval(interval);
//   }, []);

//   const validate = () => {
//     if (!email.trim()) {
//       toast.error("Email is required!");
//       return false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       toast.error("Please enter a valid email address");
//       return false;
//     }

//     if (!password.trim()) {
//       toast.error("Password is required!");
//       return false;
//     }


//     const passwordRegex =
//       /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

//     // if (!passwordRegex.test(password)) {
//     //   toast.error(
//     //     "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
//     //   );
//     //   return false;
//     // }
//     return true;
//   };

//   // const handleLogin = async () => {
//   //   if (!validate()) return;

//   //   await supabase.auth.signOut();
//   //   localStorage.clear();

//   //   try {
//   //     setLoading(true);

//   //     const res = await loginUser(email, password);

//   //     console.log("what is res", res);


//   //     if (!res.success || !res.session || !res.user) {
//   //       toast.error(res.error || "Login failed");
//   //       return;
//   //     }

//   //     // const { data, error: sessionError } = await supabase.auth.setSession({
//   //     //   access_token: res.session.access_token,
//   //     //   refresh_token: res.session.refresh_token,
//   //     // });

//   //     // console.log("Lets check data", data);
//   //     // console.log("Lets check data error", sessionError);


//   //     // if (sessionError) {
//   //     //   toast.error("Session sync failed");
//   //     //   return;
//   //     // }

//   //     // setTokens({
//   //     //   access_token: res.session.access_token,
//   //     //   refresh_token: res.session.refresh_token,
//   //     //   expires_in: res.session.expires_in,
//   //     // });

//   //     const userProfile = res.user as any;
//   //     console.log("what is userProfile", userProfile);

//   //     const role = userProfile.role?.toLowerCase();

//   //     console.log("what is role after login", role);


//   //     const roleRouteMap: Record<string, string> = {
//   //       admin: "/admin",
//   //       parent: "/parent",
//   //       faculty: "/faculty",
//   //       student: "/stu_dashboard",
//   //       superadmin: "/super-admin",
//   //       finance: "/finance",
//   //       collegeadmin: "/college-admin",
//   //       collegehr: "/hr",
//   //     };

//   //     const redirectPath = roleRouteMap[role] || "/login";

//   //     console.log("Step 1: Redirect Path:", redirectPath);

//   //     // WE ARE REMOVING THE SYNC STEP BECAUSE IT IS HANGING
//   //     console.log("Step 2: Skipping manual sync (Server handled it)...");

//   //     toast.success("Login successful!");

//   //     console.log("Step 3: Redirecting now...");

//   //     // Use window.location.assign to force the browser to pick up server cookies
//   //     setTimeout(() => {
//   //       console.log("Redirecting to:", redirectPath);
//   //       // 2. Use assign to ensure a clean navigation
//   //       window.location.assign(redirectPath);
//   //     }, 800);

//   //   } catch (error) {
//   //     console.error("GLOBAL LOGIN ERROR:", error);
//   //     toast.error("Something went wrong");
//   //   } finally {
//   //     console.log("FINALLY BLOCK RUNNING");
//   //     setLoading(false);
//   //   }
//   // };

//   const handleLogin = async () => {
//     if (!validate()) return;

//     try {
//       setLoading(true);
//       // Removed the signOut() from here to prevent clearing the session we're about to get

//       const res = await loginUser(email, password);

//       if (!res.success || !res.user) {
//         toast.error(res.error || "Login failed");
//         setLoading(false);
//         return;
//       }

//       const role = res.user.role?.toLowerCase();
//       const roleRouteMap: Record<string, string> = {
//         admin: "/admin",
//         student: "/stu_dashboard",
//         parent: "/parent",
//         faculty: "/faculty",
//         superadmin: "/super-admin",
//         finance: "/finance",
//         collegeadmin: "/college-admin",
//         collegehr: "/hr",
//       };

//       const redirectPath = roleRouteMap[role] || "/login";

//       toast.success("Login successful!");

//       // setTimeout(() => {
//       //   router.push(redirectPath);
//       //   router.refresh();
//       // }, 500);

//       window.location.href = redirectPath;

//     } catch (error) {
//       console.error("Login Error:", error);
//       toast.error("Something went wrong");
//       setLoading(false);
//     }
//   };

//   const radius = 240;

//   return (
//     <div className="w-full h-full flex">
//       <div className="w-[35%] h-screen sticky top-0 bg-linear-to-b from-[#6AE18B] to-[#B7F3CB] flex flex-col justify-between items-center p-8 overflow-hidden">
//         <div>
//           <h2
//             className={`text-xl font-semibold text-[#1B4D3E] text-center mb-1 transition-opacity duration-700`}
//           >
//             {slides[current].heading}
//           </h2>

//           <p className="text-[#1F3D2F] text-center text-sm mb-6 w-full transition-opacity ">
//             {slides[current].para}
//           </p>
//         </div>

//         {slides.map((slide, idx) => {
//           let position = "hidden";

//           if (idx === current) position = "center";
//           else if (idx === (current - 1 + slides.length) % slides.length)
//             position = "left";
//           else if (idx === (current + 1) % slides.length) position = "right";

//           const positionStyles: any = {
//             center: "rotate-0 opacity-100 z-0",
//             left: "-rotate-[40deg] opacity-0 z-10",
//             right: "rotate-[40deg] opacity-0 z-10",
//             hidden: "opacity-0 pointer-events-none",
//           };

//           return (
//             <div
//               key={idx}
//               className={`
//     absolute bottom-0 left-1/2
//     w-[65%] h-[45%]
//     flex items-center justify-center
//     transition-all duration-700 ease-in-out
//     origin-bottom
//     pointer-events-none    
//     ${positionStyles[position]}
//       `}
//               style={{
//                 transform: `
//           translateX(-50%)
//           rotate(${position === "left" ? -40 : position === "right" ? 40 : 0
//                   }deg)
//           translateY(-${radius}px)
//         `,
//               }}
//             >
//               <div
//                 className={`
//     absolute w-[250px] h-[250px] rounded-full bg-[#43C17A] opacity-80
//     top-1/2 left-1/2 
//     -translate-x-1/2 -translate-y-1/2 mt-1.5
//     z-[-1] border
//     transition-all duration-700 ease-in-out
//   `}
//                 style={{
//                   transform: `
//       translate(0%, 25%)
//       rotate(${position === "left" ? -40 : position === "right" ? 40 : 0}deg)
//     `,
//                 }}
//               ></div>

//               {/* <div className="absolute bottom-[-40%] w-[346px] h-[346px] bg-[#43C17A] rounded-full opacity-35"></div> */}

//               {/* <div className="absolute top-[15%] w-[75%] h-[95px]  rounded-3xl"></div> */}

//               <div className="relative w-full h-full p-4 mt-35 bg-transparent rounded-xl overflow-hidden flex items-center justify-center">
//                 <img
//                   src={encodeURI(slide.image)}
//                   alt={`Slide ${idx + 1}`}
//                   className="w-full h-full object-contain"
//                   loading="lazy"
//                 />
//               </div>
//             </div>
//           );
//         })}

//         <div className="flex gap-4 mt-8 relative z-20">
//           {slides.map((_, i) => (
//             <div
//               key={i}
//               className={`h-2 rounded-full transition-all duration-300 ${current === i
//                 ? "w-18 bg-[#1A5D3C]"
//                 : "w-5 bg-white/60 border border-white/40"
//                 }`}
//             ></div>
//           ))}
//         </div>
//       </div>

//       <div
//         style={{ backgroundImage: 'url(https://thumbs.dreamstime.com/b/hall-building-college-sunrise-63035568.jpg)', backgroundSize:'cover', backgroundRepeat:'no-repeat' }}
//         className="w-[65%] h-screen flex justify-center items-center bg-[#F5F6F8]">
//         <div className="w-[560px] bg-white rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8">
//           <h1 className="text-[20px] font-semibold text-[#16284F] text-center">
//             Login to Your Account
//           </h1>

//           <p className="text-[13px] text-[#414141] text-center mt-1 mb-3">
//             Please enter your credentials to proceed.
//           </p>

//           <div className="mt-6">
//             <label className="block text-[13px] text-[#414141] mb-1 ">
//               Email
//             </label>
//             <input
//               type="email"
//               placeholder="Enter your registered email"
//               className="w-full mt-1 h-11 px-4 rounded-md border border-[#DCDCDC]
//                    text-[14px] text-black focus:outline-none  placeholder:text-gray-400"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   handleLogin();
//                 }
//               }}
//             />
//           </div>

//           <div className="mt-4">
//             <label className="block text-[13px] text-[#414141] mb-1">
//               Password
//             </label>

//             <div className="relative mt-1">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     handleLogin();
//                   }
//                 }}
//                 className="w-full h-11 px-4 pr-12 rounded-md border border-[#DCDCDC]
//                      text-[14px] focus:outline-none text-black placeholder:text-gray-400"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none cursor-pointer"
//               >
//                 <Icon
//                   icon={
//                     showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"
//                   }
//                   width={20}
//                 />
//               </button>
//             </div>
//             {/* <div className="flex justify-end">
//               <button
//                 type="button"
//                 className="text-[13px] text-[#16284F] mt-2 text-right cursor-pointer underline"
//                 onClick={() => router.push("/forgot-password")}
//               >
//                 Forgot Password?
//               </button>
//             </div> */}

//             <div className="flex items-start justify-between mt-3">
//               <div className="flex items-center gap-1.5 text-[12px] text-gray-500 pr-4">
//                 <Icon
//                   icon="mdi:information-outline"
//                   width={20}
//                   className="shrink-0 text-amber-500 mt-[1px]"
//                 />
//                 <p className="leading-tight">
//                   New account? Please verify your email before logging in.
//                   If you haven’t received the verification email, check your inbox or spam folder.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 className="text-[13px] text-[#16284F] cursor-pointer hover:underline whitespace-nowrap shrink-0 font-medium"
//                 onClick={() => router.push("/forgot-password")}
//               >
//                 Forgot Password?
//               </button>

//             </div>
//           </div>

//           <div className="w-full flex justify-center mt-8">
//             <button
//               onClick={handleLogin}
//               disabled={loading}
//               className="cursor-pointer w-[200px] h-[50px] bg-[#16284F] text-white rounded text-[15px] font-medium"
//             >
//               {loading ? "Loading..." : "Signin"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";

import { loginUser } from "@/lib/helpers/loginUser";
import toast from "react-hot-toast";
import Link from "next/link";
import { EnvelopeSimple, Eye, EyeSlash, GraduationCap, Info, Lock, SpinnerGap } from "@phosphor-icons/react";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [current, setCurrent] = useState(0);

  type Slide = {
    heading: string;
    para: string;
    image: string;
  };

  const slides: Slide[] = [
    {
      heading: "Managing Campus Excellence and Operations",
      para: "Oversee students, faculty, academics, and daily campus activities — all in one place.",
      image: "/loginslide1.png",
    },
    {
      heading: "Managing Operations and User Activities",
      para: "Handle day-to-day tasks, manage users, and ensure smooth system operations — all in one place.",
      image: "/loginslide2.png",
    },
    {
      heading: "Handling Faculty and Staff Operations",
      para: "Track attendance, manage records, and streamline HR processes with ease.",
      image: "/loginslide3.png",
    },
    {
      heading: "Managing Financial Operations and Transparency",
      para: "Oversee budgets, track expenses, and manage financial records — all in one place.",
      image: "/loginslide4.png",
    },
    {
      heading: "Handling Financial Transactions and Operations",
      para: "Manage fee collections, track payments, and maintain financial records — all in one place.",
      image: "/loginslide5.png",
    },
    {
      heading: "Driving Student Placements and Success",
      para: "Manage job opportunities, campus drives, and student career growth efficiently.",
      image: "/loginslide6.png",
    },
    {
      heading: "Empowering Teaching and Student Success",
      para: "Manage classes, track student progress, and deliver quality education — all in one place.",
      image: "/loginslide7.png",
    },
    {
      heading: "Managing Learning and Academic Progress",
      para: "Track attendance, assignments, and academic performance — all in one place.",
      image: "/loginslide8.png",
    },
    {
      heading: "Staying Connected to Your Child’s Academic Journey",
      para: "Track attendance, monitor performance, and stay updated — all in one place",
      image: "/loginslide9.png",
    },
    {
      heading: "Managing Student Well-Being Activities",
      para: "Track issues, handle requests, and ensure student support with ease.",
      image: "/loginslide10.png",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    if (!email.trim()) {
      toast.error("Email is required!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      toast.error("Password is required!");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await loginUser(email, password);

      if (!res.success || !res.user) {
        toast.error(res.error || "Login failed");
        setLoading(false);
        return;
      }

      const role = res.user.role?.toLowerCase();
      const roleRouteMap: Record<string, string> = {
        admin: "/admin",
        student: "/stu_dashboard",
        parent: "/parent",
        faculty: "/faculty",
        superadmin: "/super-admin",
        finance: "/finance",
        collegeadmin: "/college-admin",
        collegehr: "/hr",
      };

      const redirectPath = roleRouteMap[role] || "/login";

      toast.success("Login successful!");
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const radius = 240;

  return (
    <div className="w-full h-full flex">
      <div className="w-[35%] h-screen sticky top-0 bg-linear-to-b from-[#6AE18B] to-[#B7F3CB] flex flex-col items-center p-6 overflow-hidden">
        <div className="bg-pink-00 flex flex-col items-center -mt-4 justify-center">
          <img
            src='https://png.pngtree.com/png-vector/20230306/ourmid/pngtree-scool-college-logo-victor-vector-png-image_6634445.png'
            height={90}
            width={90}
            alt=""
            className="rounded-full bg-transparent"
          />
          <h1 className="text-gray-700 text-xs font-semibold">Powered by GK Elite-Info</h1>
        </div>
        <div className="mt-6 bg-pink-00">
          <h2 className="text-xl font-semibold text-[#1B4D3E] text-center mb-1 transition-opacity duration-700">
            {slides[current].heading}
          </h2>
          <p className="text-[#1F3D2F] text-center text-sm w-full transition-opacity">
            {slides[current].para}
          </p>
        </div>

        {slides.map((slide, idx) => {
          let position = "hidden";
          if (idx === current) position = "center";
          else if (idx === (current - 1 + slides.length) % slides.length)
            position = "left";
          else if (idx === (current + 1) % slides.length) position = "right";

          const positionStyles: any = {
            center: "rotate-0 opacity-100 z-0",
            left: "-rotate-[40deg] opacity-0 z-10",
            right: "rotate-[40deg] opacity-0 z-10",
            hidden: "opacity-0 pointer-events-none",
          };

          return (
            <div
              key={idx}
              className={`bg-red-00 absolute -bottom-12 left-1/2 w-[80%] h-[35%] flex items-center justify-center transition-all duration-700 ease-in-out origin-bottom pointer-events-none ${positionStyles[position]}`}
              style={{
                transform: `translateX(-50%) rotate(${position === "left" ? -40 : position === "right" ? 40 : 0
                  }deg) translateY(-${radius}px)`,
              }}
            >
              <div
                className="absolute w-[480px] h-[450px] opacity-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1.5 z-[-1] transition-all duration-700 ease-in-out"
                style={{
                  transform: `translate(0%, 25%) rotate(${position === "left" ? -40 : position === "right" ? 40 : 0
                    }deg)`,
                }}
              />
              <div className="relative w-[480px] h-[350px] mt-35 rounded-xl flex items-center justify-center">
                <img
                  src={encodeURI(slide.image)}
                  alt={`Slide ${idx + 1}`}
                  className="w-[450px] h-[300px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}

        <div className="flex gap-4 mt-8 absolute z-20 bottom-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${current === i
                ? "w-18 bg-[#1A5D3C]"
                : "w-5 bg-white/60 border border-white/40"
                }`}
            />
          ))}
        </div>
      </div>

      <div
        className="w-[65%] h-screen flex justify-center items-center relative"
        style={{
          backgroundImage:
            "url('/loginpagebg.webp')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        <div
          className="relative z-10 w-[520px]"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
            padding: "40px 44px",
          }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <GraduationCap size={26} className="text-white" />
            </div>
          </div>

          <h1 className="text-[22px] font-semibold text-white text-center tracking-tight drop-shadow-md">
            Login to Your Account
          </h1>
          <p className="text-[13px] text-white/80 text-center mt-1 mb-6 drop-shadow-sm">
            Please enter your credentials to proceed.
          </p>

          <div className="mt-2">
            <label className="block text-[13px] font-semibold text-white mb-1.5 tracking-wide uppercase drop-shadow-md">
              Email
            </label>
            <div className="relative">
              <EnvelopeSimple
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
              />
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
                className="w-full h-12 pl-11 pr-4 text-[14px] text-white placeholder:text-white/60 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-[13px] font-semibold text-white mb-1.5 tracking-wide uppercase drop-shadow-md">
              Password
            </label>
            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
                className="w-full h-12 pl-11 pr-12 text-[14px] text-white placeholder:text-white/60 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeSlash size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between mt-4 gap-4">
            <div className="flex items-center gap-1.5">
              <Info size={15} className="shrink-0 text-amber-300 mt-[2px]" />
              <p className="text-[11.5px] text-white/70 leading-snug">
                New account? Verify your email before logging in. Check inbox or spam.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="text-[12.5px] text-white hover:text-white/80 cursor-pointer whitespace-nowrap shrink-0 font-medium underline underline-offset-2 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <div
            className="my-6"
            style={{
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
            }}
          />

          <div className="flex justify-center">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="relative w-full h-[48px] flex items-center justify-center rounded-[10px] text-[15px] font-semibold tracking-wide text-white bg-white/10 border border-white/30 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerGap size={18} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}