import { motion } from "framer-motion";

export default function CourseCardShimmer() {
  return (
    <div className="flex flex-col p-4 rounded-xl border border-gray-200 shadow-sm bg-white gap-4">
      <div className="flex justify-between items-start">
        <motion.div
          className="h-5 bg-gray-200 rounded-md w-3/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="h-5 bg-gray-200 rounded-md w-12"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <motion.div
          className="h-4 bg-gray-200 rounded-md w-16"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex items-center gap-2">
          <motion.div
            className="h-4 bg-gray-200 rounded-md w-10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="h-5 w-9 bg-gray-200 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
