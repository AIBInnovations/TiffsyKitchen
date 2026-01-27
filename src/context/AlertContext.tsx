import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertModal, AlertConfig, AlertType, AlertButton } from '../components/common/AlertModal';

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  showSuccess: (title: string, message: string, onOk?: () => void) => void;
  showError: (title: string, message: string, onOk?: () => void) => void;
  showWarning: (title: string, message: string, onOk?: () => void) => void;
  showInfo: (title: string, message: string, onOk?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string; isDestructive?: boolean }
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    // Delay clearing config to allow animation to complete
    setTimeout(() => {
      setAlertConfig(null);
    }, 200);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onOk?: () => void) => {
    showAlert({
      type: 'success',
      title,
      message,
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, onOk?: () => void) => {
    showAlert({
      type: 'error',
      title,
      message,
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onOk?: () => void) => {
    showAlert({
      type: 'warning',
      title,
      message,
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onOk?: () => void) => {
    showAlert({
      type: 'info',
      title,
      message,
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string; isDestructive?: boolean }
  ) => {
    const { confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false } = options || {};

    showAlert({
      type: 'confirm',
      title,
      message,
      buttons: [
        { text: cancelText, onPress: onCancel, style: 'cancel' },
        { text: confirmText, onPress: onConfirm, style: isDestructive ? 'destructive' : 'default' },
      ],
    });
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        hideAlert,
      }}
    >
      {children}
      <AlertModal visible={visible} config={alertConfig} onClose={hideAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;
