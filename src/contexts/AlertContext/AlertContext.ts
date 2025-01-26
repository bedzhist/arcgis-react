import { createContext } from 'react';

export interface Alert {
  title: string;
  message: string;
  icon: string;
  kind: HTMLCalciteAlertElement['kind'];
  autoClose?: boolean;
}

export interface AlertContextStore {
  setAlert: (alert: Alert) => void;
  showErrorAlert: (errorAlert: Omit<Alert, 'kind'>) => void;
  showSuccessAlert: (successAlert: Omit<Alert, 'kind'>) => void;
  showInfoAlert: (infoAlert: Omit<Alert, 'kind'>) => void;
  showWarningAlert: (warningAlert: Omit<Alert, 'kind'>) => void;
  showDefaultErrorAlert: () => void;
}

export const AlertContext = createContext<AlertContextStore | undefined>(
  undefined
);

export default AlertContext;
