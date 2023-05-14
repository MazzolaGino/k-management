class KManagement {


    constructor(url, users, idb, ida, idu) {

        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentWeek = Math.floor((this.currentDate - new Date(this.currentYear, 0, 1)) / 604800000) + 1;
        this.currentUser = null;
        this.users = users;

        this.calendarBody = this.getEl(idb);
        this.calendarActions = this.getEl(ida);
        this.calendarUsers = this.getEl(idu)

        this.daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        this.options = ["Aucun", "Article", "Edito", "JDX", "Perso", "Test", "Preview", "Absence"];

        this.adminUrl = url;

        this.generateWeekCalendar();
        this.prependUserList();

        var e = document.getElementById("user-list");
        this.currentUser = e.value;
        this.loadWeek();
        this.createWeekSelector();
    }

    createWeekSelector() {
       
    
        const dateInput = this.createEl("input", "date-input");

        dateInput.placeholder="dd-mm-yyyy"
        dateInput.type = "date";
        dateInput.value = this.currentDate.toISOString().slice(0, 10); // Initialiser la date actuelle

        dateInput.addEventListener("input", () => {

          this.currentDate = new Date(dateInput.value);
          this.currentYear = this.currentDate.getFullYear();
          this.currentWeek = Math.floor(
            (this.currentDate - new Date(this.currentYear, 0, 1)) / 604800000
          ) + 1;
          
          this.loadWeek();
          this.highlightSelectedDay(dateInput);
        });
       
    
        this.getEl('k-genda').appendChild(dateInput);
      }
    
      highlightSelectedDay(dateInput) {

        const selectedDate = new Date(dateInput.value);
        const tableRows = this.getEl('current-week').querySelectorAll('tbody tr');
      
        tableRows.forEach((tr) => {

            var dateTd = tr.querySelectorAll('td')[1];
            var date = dateTd.innerHTML;
            var parts = date.split('/');
            var mydate = new Date(parts[2], parts[1] - 1, parts[0]);

            if(mydate.getDay() == selectedDate.getDay()) {
                tr.classList.add('hl');
            }else{
                tr.classList.remove('hl');
            }

        });
      }

    getEl(id) {
        return document.getElementById(id);
    }

    createEl(name) {
        return document.createElement(name);
    }

    resetCalendar() {
        this.calendarBody.innerHTML = "";
    } 
      

    generateWeekCalendar() {

        this.resetCalendar();
        const table = this.createTable();
        table.setAttribute('class', 'wp-list-table widefat fixed striped table-view-list')
        table.setAttribute('id', 'current-week');
        const thead = this.createTableHeader();
        const tbody = this.createTableBody();
        this.populateTableHeader(thead);
        this.populateTableBody(tbody);
        this.appendTableContent(table, thead, tbody);
        this.appendTableToCalendar(table);

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

    populateTableHeader(thead) {
        const headers = ["Jour", "Date", "Tâche", "Intitulé"];
        headers.forEach(headerText => {
            const headerCell = this.createEl("th");
            headerCell.textContent = headerText;
            thead.appendChild(headerCell);
        });
    }

    populateTableBody(tbody) {

        const startOfWeek = new Date(this.currentYear, 0, 1 + (this.currentWeek - 1) * 7);
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
            const row = this.createEl("tr");

            const dayCell = this.createEl("td");
            dayCell.innerHTML = '<strong>' + this.daysOfWeek[currentDay.getDay()] + '</strong>';
            row.appendChild(dayCell);

            const dateCell = this.createEl("td");
            dateCell.textContent = currentDay.toLocaleDateString('ca-FR');
            row.appendChild(dateCell);

            const taskCell = this.createTaskCell(i);
            row.appendChild(taskCell);

            const descriptionCell = this.createDescriptionCell(i);
            row.appendChild(descriptionCell);

            fragment.appendChild(row);
        }

        const row = this.createEl("tr");
        row.setAttribute('class', 'management-actions');

        const prevButton = this.createEl("button");
        prevButton.className = "prev-week";
        prevButton.textContent = "<< Semaine précédente";
        prevButton.addEventListener("click", () => this.changeWeek("prev"));  

        const nextButton = this.createEl("button");
        nextButton.className = "next-week";
        nextButton.textContent = "Semaine suivante >>";
        nextButton.addEventListener("click", () => this.changeWeek("next"));

        const saveButton = this.createEl("button");
        saveButton.className = "save-week";
        saveButton.textContent = "Sauvegarde de la semaine";
        saveButton.addEventListener("click", () => this.saveWeek());


      

        const previousCell = this.createEl("td");
        previousCell.appendChild(prevButton);
        row.appendChild(previousCell);

        const emptyCell = this.createEl("td");
        emptyCell.innerHTML = '<p style="color:white; font-weight: bold; font-size: 15px; margin:15px">Semaine : ' + this.currentWeek + '/' + this.currentYear + '</p>';
        row.appendChild(emptyCell);

        const nextCell = this.createEl("td");
        nextCell.appendChild(nextButton);
        row.appendChild(nextCell);

        const saveCell = this.createEl("td");
        saveCell.appendChild(saveButton);
        row.appendChild(saveCell);


        fragment.appendChild(row);

        tbody.appendChild(fragment);
    }

    createTaskCell(index) {
        const taskCell = this.createEl("td");
        const taskSelect = this.createEl("select");
        taskSelect.setAttribute("id", "task-" + index);
        taskSelect.addEventListener("change", this.handleTaskChange.bind(this));

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
        //descriptionInput.setAttribute("type", "text");
        descriptionInput.setAttribute("id", "description-" + index);
        descriptionInput.setAttribute("value", "");
        descriptionInput.addEventListener("input", this.handleDescriptionChange.bind(this));

        descriptionCell.appendChild(descriptionInput);
        return descriptionCell;
    }

    appendTableContent(table, thead, tbody) {
        table.appendChild(thead);
        table.appendChild(tbody);
    }

    appendTableToCalendar(table) {
        this.calendarBody.appendChild(table);
    }

    prependUserList() {
        this.calendarUsers.appendChild(this.buildUserList());
    }

    changeWeek(direction) {
        if (direction === "prev") {
            this.currentWeek -= 1;
            if(this.currentWeek === 0) {
                this.currentWeek = 52;
                this.currentYear--;
            }
        } else if (direction === "next") {
            this.currentWeek += 1;
            if(this.currentWeek > 52){
                this.currentWeek = 1;
                this.currentYear ++;
            }
        }
        this.generateWeekCalendar();
        this.loadWeek();
    }


    buildUserList() {
        const userList = this.createEl("select");

        userList.setAttribute('id', 'user-list');

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
            action: "management_save_week",
            user: this.currentUser,
            week: this.currentWeek,
            year: this.currentYear,
            tasks: [],
            descriptions: []
        };

        for (let i = 0; i < 7; i++) {
            const taskSelect = this.getEl("task-" + i);
            const descriptionInput = this.getEl("description-" + i);

            weekData.tasks.push(taskSelect.value);
            weekData.descriptions.push(descriptionInput.value);
        }

        $.post(this.adminUrl, weekData, function (response) {
            // Ajoutez votre logique de traitement de la réponse ici

            alert('Semaine Sauvegardée !');
        });
    }

    loadWeek() {
        this.generateWeekCalendar();
        const weekData = {
            action: "management_get_week",
            user: this.currentUser,
            week: this.currentWeek,
            year: this.currentYear
        };

        $.post(this.adminUrl, weekData, function (response) {

            var response = JSON.parse(response);

            if (response && response.tasks && response.descriptions) {

                weekData.tasks = response.tasks;
                weekData.descriptions = response.descriptions;

                for (let i = 0; i < 7; i++) {

                    const taskSelect = document.getElementById("task-" + i);
                    const descriptionInput = document.getElementById("description-" + i);

                    taskSelect.value = weekData.tasks[i];
                    descriptionInput.value = weekData.descriptions[i];

                }

          
            }
        });
    }

    handleTaskChange(event) {
        const taskId = event.target.id;
        const taskValue = event.target.value;
        console.log("Tâche mise à jour pour l'ID " + taskId + " : " + taskValue);
        // Ajoutez votre logique de sauvegarde ou de traitement ici
    }

    handleUserChange(event) {
        this.currentUser = event.target.value;
        console.log("Utilisateur courant mis à jour avec l'ID " + this.currentUser);
        this.loadWeek();
    }

    handleDescriptionChange(event) {
        const descriptionId = event.target.id;
        const descriptionValue = event.target.value;
        console.log("Description mise à jour pour l'ID " + descriptionId + " : " + descriptionValue);
        // Ajoutez votre logique de sauvegarde ou de traitement ici
    }

    getWeekData(user, currentWeek = null) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        if (!currentWeek) {
            currentWeek = Math.floor((currentDate - new Date(currentYear, 0, 1)) / 604800000) + 1;
        }

        const weekData = {
            action: "management_get_week",
            user: user,
            week: currentWeek,
            year: currentYear,
            tasks: [],
            descriptions: []
        };

        $.post(this.adminUrl, weekData, function (response) {
            console.log(response);

            var response = JSON.parse(response);

            if (response && response.tasks && response.descriptions) {


                weekData.tasks = parsedResponse.tasks;
                weekData.descriptions = parsedResponse.descriptions;

                for (let i = 0; i < 7; i++) {
                    const taskSelect = this.getEl("task-" + i);
                    const descriptionInput = this.getEl("description-" + i);

                    taskSelect.value = weekData.tasks[i];
                    descriptionInput.value = weekData.descriptions[i];

                    taskSelect.disabled = true;
                    descriptionInput.disabled = true;
                }
            }
        });
    }

}

class KUserWeeks {


    constructor(url, user, idb, ida) {

        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentWeek = Math.floor((this.currentDate - new Date(this.currentYear, 0, 1)) / 604800000) + 1;
        this.currentUser = user;

        this.calendarBody = this.getEl(idb);
        this.calendarActions = this.getEl(ida);

        this.daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        this.options = ["Aucun", "Edito", "JDX", "Article Original", "Test", "Preview"];

        this.adminUrl = url;

        this.generateWeekCalendar();
        this.loadWeek();
    }

    getEl(id) {
        return document.getElementById(id);
    }

    createEl(name) {
        return document.createElement(name);
    }

    resetCalendar() {
        this.calendarBody.innerHTML = "";
    }

    generateWeekCalendar() {

        this.resetCalendar();
        const table = this.createTable();
        table.setAttribute('class', 'wp-list-table widefat fixed striped table-view-list')
        const thead = this.createTableHeader();
        const tbody = this.createTableBody();
        this.populateTableHeader(thead);
        this.populateTableBody(tbody);
        this.appendTableContent(table, thead, tbody);
        this.appendTableToCalendar(table);

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

    populateTableHeader(thead) {
        const headers = ["Jour", "Date", "Tâche", "Intitulé"];
        headers.forEach(headerText => {
            const headerCell = this.createEl("th");
            headerCell.textContent = headerText;
            thead.appendChild(headerCell);
        });
    }

    populateTableBody(tbody) {

        const startOfWeek = new Date(this.currentYear, 0, 1 + (this.currentWeek - 1) * 7);
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
            const row = this.createEl("tr");

            const dayCell = this.createEl("td");
            dayCell.innerHTML = '<strong>' + this.daysOfWeek[currentDay.getDay()] + '</strong>';
            row.appendChild(dayCell);

            const dateCell = this.createEl("td");
            dateCell.textContent = currentDay.toLocaleDateString('ca-FR');
            row.appendChild(dateCell);

            const taskCell = this.createTaskCell(i);
            row.appendChild(taskCell);

            const descriptionCell = this.createDescriptionCell(i);
            row.appendChild(descriptionCell);

            fragment.appendChild(row);
        }

        const row = this.createEl("tr");

        row.setAttribute('class', 'management-actions');

        const prevButton = this.createEl("button");
        prevButton.className = "user-prev-week";
        prevButton.textContent = "<< Semaine précédente";
        prevButton.addEventListener("click", () => this.changeWeek("prev"));  

        const nextButton = this.createEl("button");
        nextButton.className = "user-next-week";
        nextButton.textContent = "Semaine suivante >>";
        nextButton.addEventListener("click", () => this.changeWeek("next"));

        const emptyCell = this.createEl("td");
        emptyCell.innerHTML = '<p style="color:white; font-weight: bold; font-size: 15px; margin:15px">Semaine : ' + this.currentWeek + '/' + this.currentYear + '</p>';

        const previousCell = this.createEl("td");
        previousCell.appendChild(prevButton);

        const nextCell = this.createEl("td");
        nextCell.appendChild(nextButton);

        const empty2Cell = this.createEl("td");
        empty2Cell.innerHTML = '';

        row.appendChild(previousCell);
        row.appendChild(emptyCell);
        row.appendChild(nextCell);
        row.appendChild(empty2Cell);


        fragment.appendChild(row);



        tbody.appendChild(fragment);
    }

    createTaskCell(index) {
        const taskCell = this.createEl("td");

        taskCell.setAttribute("id", "user-task-" + index);

        return taskCell;
    }

    createDescriptionCell(index) {

        const descriptionCell = this.createEl("td");
        descriptionCell.setAttribute("id", "user-description-" + index);
        return descriptionCell;
    }

    appendTableContent(table, thead, tbody) {
        table.appendChild(thead);
        table.appendChild(tbody);
    }

    appendTableToCalendar(table) {
        this.calendarBody.appendChild(table);
    }


    changeWeek(direction) {
        if (direction === "prev") {
            this.currentWeek -= 1;
            if(this.currentWeek === 0) {
                this.currentWeek = 52;
                this.currentYear--;
            }
        } else if (direction === "next") {
            this.currentWeek += 1;
            if(this.currentWeek > 52){
                this.currentWeek = 1;
                this.currentYear ++;
            }
        }
        this.generateWeekCalendar();
        this.loadWeek();
    }

    loadWeek() {
        this.generateWeekCalendar();
        const weekData = {
            action: "management_get_week",
            user: this.currentUser,
            week: this.currentWeek,
            year: this.currentYear
        };

        $.post(this.adminUrl, weekData, function (response) {

            var response = JSON.parse(response);

            if (response && response.tasks && response.descriptions) {

                weekData.tasks = response.tasks;
                weekData.descriptions = response.descriptions;

                for (let i = 0; i < 7; i++) {

                    const taskSelect = document.getElementById("user-task-" + i);
                    const descriptionInput = document.getElementById("user-description-" + i);

                    taskSelect.innerHTML = weekData.tasks[i];
                    descriptionInput.innerHTML = weekData.descriptions[i];

                }
            }
        });
    }

}