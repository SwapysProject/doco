// context/PatientModalContext.tsx
import { createContext, useContext, useState } from "react";

const PatientModalContext = createContext({
  showAddModal: false,
  openAddModal: () => {},
  closeAddModal: () => {},
});

export const PatientModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <PatientModalContext.Provider
      value={{
        showAddModal,
        openAddModal: () => setShowAddModal(true),
        closeAddModal: () => setShowAddModal(false),
      }}
    >
      {children}
    </PatientModalContext.Provider>
  );
};

export const usePatientModal = () => useContext(PatientModalContext);
