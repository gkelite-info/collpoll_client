import { NotePencil, X } from "@phosphor-icons/react";

export function AddReminderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const inputClass =
    "h-11 rounded-lg border border-[#6B7280] bg-white px-4 text-[14px] font-semibold text-[#17213D] outline-none placeholder:text-[#7B8AA3] focus:border-[#237333]";

  const helperClass = "mt-1.5 text-[10px] font-medium text-[#525252]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/55 px-4 py-6">
      <section className="mx-auto flex max-h-[78vh] w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_20px_45px_rgba(15,23,42,0.24)]">
        <header className="flex shrink-0 items-center justify-between border-b border-[#E6E8EB] px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DDF8E9] text-[#1A9B55]">
              <NotePencil size={20} weight="bold" />
            </span>
            <h2 className="text-[19px] font-bold text-[#17213D]">Add Reminder</h2>
          </div>
          <button
            type="button"
            aria-label="Close add reminder modal"
            onClick={onClose}
            className="cursor-pointer text-[#8C9AB0]"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <form className="flex-1 overflow-y-auto px-6 py-6">
          <label className="block">
            <span className="text-[14px] font-bold text-[#17213D]">
              Reminder Title <span className="text-[#FF4B4B]">*</span>
            </span>
            <input
              type="text"
              placeholder="Enter reminder title"
              className={`mt-2 w-full ${inputClass}`}
            />
            <p className={helperClass}>E.g. Electricity Bill, Staff Salary, Fee Collection</p>
          </label>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Type <span className="text-[#FF4B4B]">*</span>
              </span>
              <select className={`mt-2 w-full cursor-pointer ${inputClass}`}>
                <option>Select type</option>
                <option>To Pay</option>
                <option>To Receive</option>
              </select>
              <p className={helperClass}>To Pay or To Receive</p>
            </label>
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Category <span className="text-[#FF4B4B]">*</span>
              </span>
              <select className={`mt-2 w-full cursor-pointer ${inputClass}`}>
                <option>Select category</option>
                <option>Utility</option>
                <option>Salary</option>
                <option>Fee Collection</option>
                <option>Subscription</option>
                <option>Tax</option>
              </select>
              <p className={helperClass}>Choose appropriate category</p>
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Amount <span className="text-[#FF4B4B]">*</span>
              </span>
              <div className={`mt-2 flex items-center gap-2 ${inputClass}`}>
                <span className="text-[14px] font-semibold text-[#17213D]">Rs</span>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full bg-transparent outline-none"
                />
              </div>
              <p className={helperClass}>Enter amount</p>
            </label>
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Due Date <span className="text-[#FF4B4B]">*</span>
              </span>
              <input
                type="date"
                className={`mt-2 w-full ${inputClass}`}
                style={{ colorScheme: "light" }}
              />
              <p className={helperClass}>Select due date</p>
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">Repeat</span>
              <select className={`mt-2 w-full cursor-pointer ${inputClass}`}>
                <option>One Time</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <p className={helperClass}>Set how often this reminder repeats</p>
            </label>
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Notify Before
              </span>
              <select className={`mt-2 w-full cursor-pointer ${inputClass}`}>
                <option>1 day before</option>
                <option>2 days before</option>
                <option>1 week before</option>
              </select>
              <p className={helperClass}>When do you want to be notified?</p>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-[14px] font-bold text-[#17213D]">
              Description (Optional)
            </span>
            <textarea
              placeholder="Enter description or notes..."
              className="mt-2 min-h-[78px] w-full resize-none rounded-lg border border-[#6B7280] bg-white px-4 py-3 text-[14px] font-semibold text-[#17213D] outline-none placeholder:text-[#7B8AA3] focus:border-[#237333]"
            />
            <p className={helperClass}>Add any additional notes about this reminder</p>
          </label>
        </form>

        <footer className="flex shrink-0 justify-end gap-4 border-t border-[#E6E8EB] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 min-w-[118px] cursor-pointer rounded-lg border border-[#DDE5EE] bg-white px-6 text-[14px] font-bold text-[#525252]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 min-w-[160px] cursor-pointer rounded-lg bg-[#087A34] px-6 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(8,122,52,0.18)]"
          >
            Add Reminder
          </button>
        </footer>
      </section>
    </div>
  );
}
