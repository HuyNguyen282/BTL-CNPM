document.addEventListener("DOMContentLoaded", () => {
    const editButtons = document.querySelectorAll(".edit-btn");
    const editId = document.getElementById("editId");
    const editName = document.getElementById("editName");
    const editAmount = document.getElementById("editAmount");
    const editDate = document.getElementById("editDate");
    const editNote = document.getElementById("editNote");
    const editExpenseType = document.getElementById("editExpenseType");

    editButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            editId.value = btn.dataset.id;
            editName.value = btn.dataset.name;
            editAmount.value = btn.dataset.amount;
            editDate.value = btn.dataset.date;
            editNote.value = btn.dataset.note || "";
            editExpenseType.value = btn.dataset.type;
        });
    });
});
