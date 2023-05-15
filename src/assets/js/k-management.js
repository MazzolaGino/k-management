class KManagement {

    constructor(url, users, idb, idd, idu, prefix = '') {

        this.currentUser = null;
        this.prefix = prefix;

        //selectors
        this.currentWeekSelector = this.getPrefix() + 'current-week';
        this.taskSelector = this.getPrefix() + 'task-';
        this.descriptionSelector = this.getPrefix() + 'description-';
        this.datepickerSelector = idd;

        //actions
        this.actions = {
            save: 'management_save_week',
            get: 'management_get_week',
        };


        this.adminUrl = url;
        this.users = users;
        this.daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        this.options = ["Aucun", "Article", "Edito", "JDX", "Perso", "Test", "Preview", "Absence"];
        this.daysOfWeekHead = ["Jour", "Date", "Tâche", "Description"];

        this.calendarBody = this.getEl(idb);
        this.calendarUsers = this.getEl(idu);

        this.currentDate = new Date();
        this.currentYear = this.getCurrentYear();
        this.currentWeek = this.getCurrentWeek();

        this.init();



        this.loadWeek();
    }

    getPrefix()
    {
        return this.prefix;
    }

    init() {
        this.dateInput = this.createDateInput();
        this.generateWeekCalendar();
        this.prependUserList();
        this.createWeekSelector();
    }

    // Create methods
    createWeekSelector() {
        this.getEl(this.datepickerSelector).prepend(this.dateInput);
    }

    createDateInput() {
        // Create a date input element
        const dateInput = this.createEl("input", "date-input");

        // Set the placeholder text
        dateInput.placeholder = "dd-mm-yyyy";

        // Set the input type to date
        dateInput.type = "date";

        // Set the initial value to the current date
        dateInput.value = this.getCurrentDate();

        // Add an event listener for input changes
        dateInput.addEventListener("input", () => {
            // Update the current date based on the input value
            this.currentDate = new Date(dateInput.value);
            this.currentYear = this.currentDate.getFullYear();

            // Update the current week based on the new date
            this.currentWeek = this.getCurrentWeek();

            // Load the updated week data
            this.loadWeek();

            // Highlight the selected day in the calendar
            this.highlightSelectedDay();
        });

        return dateInput;
    }

    createEl(name) {
        return document.createElement(name);
    }

    createManagementActionsRow() {
        const row = this.createEl("tr");
        row.classList.add('management-actions');
        return row;
    }

    createTaskCell(index) {
        const taskCell = this.createEl("td");
        const taskSelect = this.createEl("select");
        taskSelect.setAttribute("id", this.taskSelector + index);

        this.options.forEach(option => {
            const taskOption = this.createEl("option");
            taskOption.textContent = option;
            taskOption.setAttribute("value", option);
            taskSelect.appendChild(taskOption);
        });

        taskCell.appendChild(taskSelect);
        return taskCell;
    }

    createDescriptionCell(index) {
        const descriptionCell = this.createEl("td");
        const descriptionInput = this.createEl("textarea");
        descriptionInput.setAttribute("id", this.descriptionSelector + index);
        descriptionInput.setAttribute("value", "");

        const editorInfo = this.createEl('span');
        editorInfo.innerHTML = 'Information Edition : <br /> Nouvelle ligne : &lt;br /&gt <br /> Mot en gras : &lt;strong&gt mot &lt;/strong&gt ';
        descriptionCell.appendChild(editorInfo);
        descriptionCell.appendChild(descriptionInput);

        return descriptionCell;
    }

    createTable() {
        return this.createEl("table");
    }

    createTableHeader() {
        return this.createEl("thead");
    }

    createTableBody() {
        return this.createEl("tbody");
    }

    // Append methods
    appendPrevButtonCell(row) {
        const prevButton = this.createEl("button");
        prevButton.className = this.getPrefix() + "prev-week";
        prevButton.textContent = "<< Semaine précédente";
        prevButton.addEventListener("click", () => this.changeWeek("prev"));

        const previousCell = this.createEl("td");
        previousCell.appendChild(prevButton);
        row.appendChild(previousCell);

        return this;
    }

    appendNextButtonCell(row) {
        const nextButton = this.createEl("button");
        nextButton.className = this.getPrefix() + "next-week";
        nextButton.textContent = "Semaine suivante >>";
        nextButton.addEventListener("click", () => this.changeWeek("next"));

        const nextCell = this.createEl("td");
        nextCell.appendChild(nextButton);
        row.appendChild(nextCell);

        return this;
    }

    appendSaveButtonCell(row) {
        const saveButton = this.createEl("button");
        saveButton.className = this.getPrefix() + "save-week";
        saveButton.textContent = "Sauvegarde de la semaine";
        saveButton.addEventListener("click", () => this.saveWeek());

        const saveCell = this.createEl("td");
        saveCell.appendChild(saveButton);
        row.appendChild(saveCell);

        return this;
    }

    appendTableContent(table, thead, tbody) {
        table.appendChild(thead);
        table.appendChild(tbody);

        return this;
    }

    appendTableToCalendar(table) {
        this.calendarBody.appendChild(table);

        return this;
    }

    appendDayCell(row, currentDay) {
        const dayCell = this.createEl("td");
        dayCell.innerHTML = `<strong>${this.daysOfWeek[currentDay.getDay()]}</strong>`;
        row.appendChild(dayCell);

        return this;
    }

    appendDateCell(row, currentDay) {
        const dateCell = this.createEl("td");
        dateCell.textContent = currentDay.toLocaleDateString('ca-FR');
        row.appendChild(dateCell);

        return this;
    }

    appendTaskCell(row, index) {
        row.appendChild(this.createTaskCell(index));

        return this;
    }

    appendDescriptionCell(row, index) {
        row.appendChild(this.createDescriptionCell(index));

        return this;
    }

    appendEmptyCell(row) {
        const emptyCell = this.createEl("td");
        emptyCell.innerHTML = '<p style="color:white; font-weight: bold; font-size: 15px; margin:15px">Semaine : ' + this.currentWeek + '/' + this.currentYear + '</p>';
        row.appendChild(emptyCell);

        return this;
    }


    prependUserList() {
        this.calendarUsers.appendChild(this.buildUserList());
        return this;
    }

    // Getter methods
    getCurrentDay(dayIndex) {
        const startOfWeek = new Date(this.currentYear, 0, 1 + (this.currentWeek - 1) * 7);
        return new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + dayIndex);
    }

    getCurrentWeek() {
        return Math.floor((this.currentDate - new Date(this.currentYear, 0, 1)) / 604800000) + 1;
    }

    getCurrentYear() {
        return this.currentDate.getFullYear();
    }

    getCurrentDate() {
        return this.currentDate.toISOString().slice(0, 10);
    }

    getEl(id) {
        return document.getElementById(id);
    }

    // Populate methods
    populateTableHeader(thead) {
        this.daysOfWeekHead.forEach(headerText => {
            const headerCell = this.createEl("th");
            headerCell.textContent = headerText;
            thead.appendChild(headerCell);
        });

        return this;
    }

    populateTableBody(tbody) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 7; i++) {
            const row = this.createEl("tr");
            this.appendDayCell(row, this.getCurrentDay(i));
            this.appendDateCell(row, this.getCurrentDay(i));
            this.appendTaskCell(row, i);
            this.appendDescriptionCell(row, i);

            fragment.appendChild(row);
        }

        const managementActionsRow = this.createManagementActionsRow();

        this.appendPrevButtonCell(managementActionsRow)
            .appendEmptyCell(managementActionsRow)
            .appendNextButtonCell(managementActionsRow)
            .appendSaveButtonCell(managementActionsRow);

        fragment.appendChild(managementActionsRow);
        tbody.appendChild(fragment);

        return this;
    }

    // Handle methods
    handleUserChange(event) {
        this.currentUser = event.target.value;
        this.loadWeek();
    }

    // Action methods
    highlightSelectedDay() {
        const selectedDate = new Date(this.dateInput.value);
        const tableRows = this.getEl(this.currentWeekSelector).querySelectorAll('tbody tr');

        tableRows.forEach((tr) => {
            var dateTd = tr.querySelectorAll('td')[1];
            var date = dateTd.innerHTML;
            var parts = date.split('/');
            var mydate = new Date(parts[2], parts[1] - 1, parts[0]);

            if (mydate.getDay() == selectedDate.getDay()) {
                tr.classList.add(this.getPrefix() + 'hl');
            } else {
                tr.classList.remove(this.getPrefix() + 'hl');
            }
        });
    }

    resetCalendar() {
        this.calendarBody.innerHTML = "";
    }

    generateWeekCalendar() {
        this.resetCalendar();
        const table = this.createTable();
        table.setAttribute('class', this.getPrefix() + ' wp-list-table widefat fixed striped table-view-list')
        table.setAttribute('id', this.currentWeekSelector);
        const thead = this.createTableHeader();
        const tbody = this.createTableBody();
        this.populateTableHeader(thead).populateTableBody(tbody);
        this.appendTableContent(table, thead, tbody);
        this.appendTableToCalendar(table);
    }

    changeWeek(direction) {
        const weeksInYear = 52;

        const weekChanges = {
            prev: {
                week: -1,
                year: 0
            },
            next: {
                week: 1,
                year: 0
            }
        };

        const { week, year } = weekChanges[direction];
        this.currentWeek += week;
        this.currentYear += year;

        if (this.currentWeek === 0) {
            this.currentWeek = weeksInYear;
            this.currentYear--;
        } else if (this.currentWeek > weeksInYear) {
            this.currentWeek = 1;
            this.currentYear++;
        }

        this.generateWeekCalendar();
        this.loadWeek();
    }


    buildUserList() {
        const userList = this.createEl("select");

        this.users.forEach(user => {
            const option = this.createEl("option");
            option.value = user.ID;
            option.innerHTML = user.data.display_name;
            userList.appendChild(option);
        });

        userList.value = this.currentUser;
        userList.addEventListener("change", this.handleUserChange.bind(this));

        return userList;
    }

    saveWeek() {
        const weekData = {
            action: this.actions.save,
            user: this.currentUser,
            week: this.currentWeek,
            year: this.currentYear,
            tasks: [],
            descriptions: []
        };

        for (let i = 0; i < 7; i++) {
            const taskSelect = this.getEl(this.taskSelector + i);
            const descriptionInput = this.getEl(this.descriptionSelector + i);

            weekData.tasks.push(taskSelect.value);
            weekData.descriptions.push(descriptionInput.value);
        }

        $.post(this.adminUrl, weekData, function (response) {
            alert('Semaine Sauvegardée !');
        });
    }

    loadWeek() {
        this.generateWeekCalendar();
        const weekData = {
            action: this.actions.get,
            user: this.currentUser,
            week: this.currentWeek,
            year: this.currentYear
        };

        $.post(this.adminUrl, weekData, (response) => {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse && parsedResponse.tasks && parsedResponse.descriptions) {
                weekData.tasks = parsedResponse.tasks;
                weekData.descriptions = parsedResponse.descriptions;

                this.updateTaskAndDescriptionValues(weekData);
            }
        });
    }

    updateTaskAndDescriptionValues(weekData) {

        for (let i = 0; i < 7; i++) {
            const taskSelect = document.getElementById(this.taskSelector + i);
            const descriptionInput = document.getElementById(this.descriptionSelector + i);

            taskSelect.value = weekData.tasks[i];
            descriptionInput.value = weekData.descriptions[i];
        }
    }
}