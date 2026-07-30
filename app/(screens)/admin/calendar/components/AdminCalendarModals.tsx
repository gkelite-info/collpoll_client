import EventDetailsModal from "@/app/(screens)/faculty/calendar/modal/EventDetailsModal";
import AddEventModal from "./addEventModal";
import ConfirmConflictModal from "./ConfirmConflictModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

type AdminCalendarModalsProps = {
  // Hook State
  isModalOpen: boolean;
  eventForm: any;
  formMode: "create" | "edit";
  isSaving: boolean;
  showConflictModal: boolean;
  conflictDetails: any[];
  eventToDelete: any;
  isDeleting: boolean;
  showDetails: boolean;
  selectedEvent: any;
  degreeOptions: any[];
  isSchool: boolean;
  facultyId: string;

  // Hook Handlers
  closeAddEventModal: () => void;
  handleSaveEvent: (payload: any) => Promise<void>;
  confirmAddEvent: () => void;
  handleConflictCancel: () => void;
  handleDeleteEvent: (event: any) => Promise<boolean>;
  setEventToDelete: (event: any) => void;
  setShowDetails: (open: boolean) => void;
  setSelectedEvent: (event: any) => void;
};

export default function AdminCalendarModals({
  isModalOpen,
  eventForm,
  formMode,
  isSaving,
  showConflictModal,
  conflictDetails,
  eventToDelete,
  isDeleting,
  showDetails,
  selectedEvent,
  degreeOptions,
  isSchool,
  facultyId,
  closeAddEventModal,
  handleSaveEvent,
  confirmAddEvent,
  handleConflictCancel,
  handleDeleteEvent,
  setEventToDelete,
  setShowDetails,
  setSelectedEvent,
}: AdminCalendarModalsProps) {
  return (
    <>
      <AddEventModal
        isOpen={isModalOpen}
        value={{ ...eventForm, facultyId }}
        onClose={closeAddEventModal}
        onSave={handleSaveEvent}
        degreeOptions={degreeOptions}
        isSaving={isSaving}
        mode={formMode}
        disableOutsideClick={showConflictModal}
      />

      <ConfirmConflictModal
        open={showConflictModal}
        onConfirm={confirmAddEvent}
        onCancel={handleConflictCancel}
        conflictDetails={conflictDetails}
      />

      <ConfirmDeleteModal
        open={!!eventToDelete}
        isDeleting={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setEventToDelete(null);
        }}
        onConfirm={async () => {
          if (!eventToDelete) return;
          const success = await handleDeleteEvent(eventToDelete);
          if (success) {
            setEventToDelete(null);
          }
        }}
      />

      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false);
          setSelectedEvent(null);
        }}
        isSchool={isSchool}
      />
    </>
  );
}
