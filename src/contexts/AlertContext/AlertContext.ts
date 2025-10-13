import { createContext } from 'react';

export interface AlertData {
  id: string;
  title: string;
  message: string;
  icon: string;
  kind: HTMLCalciteAlertElement['kind'];
  autoClose?: boolean;
}

export type AlertProps = Omit<AlertData, 'id'>;

export interface AlertContextStore {
  hideAlert: (id: string) => void;
  showErrorAlert: (errorAlert: Omit<AlertProps, 'kind'>) => void;
  showSuccessAlert: (successAlert: Omit<AlertProps, 'kind'>) => void;
  showInfoAlert: (infoAlert: Omit<AlertProps, 'kind'>) => void;
  showWarningAlert: (warningAlert: Omit<AlertProps, 'kind'>) => void;
  showDefaultErrorAlert: () => void;
}

export const AlertContext = createContext<AlertContextStore | undefined>(
  undefined
);

export default AlertContext;
