import { createContext } from 'react';

export interface AlertData {
  id: string;
  title: string;
  message: string;
  icon: string;
  kind: HTMLCalciteAlertElement['kind'];
  autoClose?: boolean;
}

export type AlertParams = Omit<AlertData, 'id'>;

export interface AlertContextStore {
  hideAlert: (id: string) => void;
  showErrorAlert: (params: Omit<AlertParams, 'kind'>) => void;
  showSuccessAlert: (params: Omit<AlertParams, 'kind'>) => void;
  showInfoAlert: (params: Omit<AlertParams, 'kind'>) => void;
  showWarningAlert: (params: Omit<AlertParams, 'kind'>) => void;
  showDefaultErrorAlert: () => void;
}

export const AlertContext = createContext<AlertContextStore | undefined>(
  undefined
);

export default AlertContext;
