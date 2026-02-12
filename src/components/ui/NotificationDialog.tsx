"use client";

import React from "react";

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title: string;
  type: "success" | "error";
}

// Notifications are now handled elsewhere (toast, etc.), so this dialog
// should never render anything or show an overlay.
const NotificationDialog: React.FC<NotificationDialogProps> = () => {
  return null;
};

export default NotificationDialog;