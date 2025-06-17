"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";


interface PopupProps {
  openModal: boolean;
  content: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ openModal, content }) => {

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
};

  return (
    <AnimatePresence>
      {openModal && (
        <motion.div
          className="fixed inset-0 bg-white/80 bg-opacity-50 flex justify-center items-center z-50 overflow-y-scroll "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-4 hide-scrollbar w-[90%] lg:w-[50%] rounded-lg flex flex-col justify-center  "
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
