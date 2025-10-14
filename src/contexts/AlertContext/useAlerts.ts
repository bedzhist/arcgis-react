import { useState } from 'react';
import { v4 } from 'uuid';
import { AlertData, AlertParams } from '.';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showErrorAlert = (params: Omit<AlertParams, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...params, kind: 'danger', id: v4() }
    ]);
  const showSuccessAlert = (params: Omit<AlertParams, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...params, kind: 'success', id: v4() }
    ]);
  const showInfoAlert = (params: Omit<AlertParams, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...params, kind: 'info', id: v4() }
    ]);
  const showWarningAlert = (params: Omit<AlertParams, 'kind'>) =>
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { ...params, kind: 'warning', id: v4() }
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
