import { useState } from 'react';
import { v4 } from 'uuid';
import { AlertData, AlertProps } from '.';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showErrorAlert = (errorAlert: Omit<AlertProps, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...errorAlert, kind: 'danger', id: v4() }
    ]);
  const showSuccessAlert = (successAlert: Omit<AlertProps, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...successAlert, kind: 'success', id: v4() }
    ]);
  const showInfoAlert = (infoAlert: Omit<AlertProps, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...infoAlert, kind: 'info', id: v4() }
    ]);
  const showWarningAlert = (warningAlert: Omit<AlertProps, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...warningAlert, kind: 'warning', id: v4() }
    ]);
  const showDefaultErrorAlert = () =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      {
        id: v4(),
        title: 'Error',
        message:
          'An error occurred. Please contact support if the problem persists.',
        icon: 'exclamation-mark-triangle',
        kind: 'danger'
      }
    ]);
  const hideAlert = (id: string) =>
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));

  const alertMethods = {
    hideAlert,
    showErrorAlert,
    showSuccessAlert,
    showInfoAlert,
    showWarningAlert,
    showDefaultErrorAlert
  };

  return [alerts, alertMethods] as const;
};

export default useAlerts;
