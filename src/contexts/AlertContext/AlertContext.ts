import { createContext } from 'react';

export interface Alert {
  title: string;
  message: string;
  icon: string;
  kind: HTMLCalciteAlertElement['kind'];
}

export interface AlertContextStore {
  setAlert: (alert: Alert) => void;
  setErrorAlert: (errorAlert: Omit<Alert, 'kind'>) => void;
  setSuccessAlert: (successAlert: Omit<Alert, 'kind'>) => void;
  setInfoAlert: (infoAlert: Omit<Alert, 'kind'>) => void;
  setWarningAlert: (warningAlert: Omit<Alert, 'kind'>) => void;
  showDefaultErrorAlert: () => void;
}

export const AlertContext = createContext<AlertContextStore | undefined>(
  undefined
);

export default AlertContext;
