"use client";

import EventDetailsModal from "../modal/EventDetailsModal";
import AddEventModal from "./addEventModal";
import ConfirmConflictModal from "../../../admin/calendar/components/ConfirmConflictModal";
import ConfirmDeleteModal from "../../../admin/calendar/components/ConfirmDeleteModal";

type FacultyCalendarModalsProps = {
  // Hook State
  isModalOpen: boolean;
  eventForm: any;
  formMode: "create" | "edit";
  isSaving: boolean;
  showConflictModal: boolean;
  conflictDetails: any[];
  eventToDelete: any;
  isDeleteLoading: boolean;
  showDetails: boolean;
  selectedEvent: any;
  degreeOptions: any[];

  // Hook Handlers
  closeAddEventModal: () => void;
  handleSaveEvent: (payload: any) => Promise<{ success: boolean }>;
  confirmAddEvent: () => void;
  handleConflictCancel: () => void;
  handleDeleteEvent: (event: any) => Promise<void>;
  setEventToDelete: (event: any) => void;
  setShowDetails: (open: boolean) => void;
  setSelectedEvent: (event: any) => void;
};

export default function FacultyCalendarModals({
  isModalOpen,
  eventForm,
  formMode,
  isSaving,
  showConflictModal,
  conflictDetails,
  eventToDelete,
  isDeleteLoading,
  showDetails,
  selectedEvent,
  degreeOptions,
  closeAddEventModal,
  handleSaveEvent,
  confirmAddEvent,
  handleConflictCancel,
  handleDeleteEvent,
  setEventToDelete,
  setShowDetails,
  setSelectedEvent,
}: FacultyCalendarModalsProps) {
  return (
    <>
      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false);
          setSelectedEvent(null);
        }}
      />

      <AddEventModal
        isOpen={isModalOpen}
        value={eventForm}
        initialData={eventForm}
        onClose={closeAddEventModal}
        onSave={handleSaveEvent}
        degreeOptions={degreeOptions}
        isSaving={isSaving}
        mode={formMode}
      />

      <ConfirmConflictModal
        open={showConflictModal}
        onConfirm={confirmAddEvent}
        onCancel={handleConflictCancel}
        conflictDetails={conflictDetails}
      />

      <ConfirmDeleteModal
        open={!!eventToDelete}
        onCancel={() => setEventToDelete(null)}
        onConfirm={async () => {
          if (eventToDelete) await handleDeleteEvent(eventToDelete);
          setEventToDelete(null);
        }}
        isDeleting={isDeleteLoading}
      />
    </>
  );
}
