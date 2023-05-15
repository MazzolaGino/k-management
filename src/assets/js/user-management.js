class KManagementReadOnly extends KManagement {

    constructor(url, user, idb, ida, idu, prefix) {
      super(url, user, idb, ida, idu, prefix);
      
      this.currentUser = user[0].ID;
      document.querySelector('#' + idu + ' select' ).value = this.currentUser;

      this.loadWeek();
    }

    createTaskCell(index) {
        const taskCell = document.createElement("td");
        taskCell.setAttribute("id", this.taskSelector + index);
        taskCell.textContent = ""; // Set empty text content
        return taskCell;
      }
      
      createDescriptionCell(index) {
        const descriptionCell = document.createElement("td");
        descriptionCell.setAttribute("id", this.descriptionSelector + index);
        descriptionCell.textContent = ""; // Set empty text content
        return descriptionCell;
      }
  
    appendTaskCell(row, index) {
      row.appendChild(this.createTaskCell(index));
      return this;
    }
  
    appendDescriptionCell(row, index) {
      row.appendChild(this.createDescriptionCell(index));
      return this;
    }
  
    appendSaveButtonCell(row) {
        row.appendChild(this.createEl('td'));
        return this;
    }
  
    loadWeek() {
        this.generateWeekCalendar();
        const weekData = {
          action: "management_get_user_week",
          user: this.currentUser,
          week: this.currentWeek,
          year: this.currentYear,
        };
      
        const self = this;
      
        $.post(this.adminUrl, weekData, function (response) {
          var response = JSON.parse(response);

          if(response.user === "") {
            self.loadWeek();
          }

          if (response && response.tasks && response.descriptions) {
            weekData.tasks = response.tasks;
            weekData.descriptions = response.descriptions;
            weekData.dones = (response.dones)? response.dones: [];
      
            for (let i = 0; i < 7; i++) {
              const taskSelect = document.getElementById(self.taskSelector + i);
              const descriptionInput = document.getElementById(self.descriptionSelector + i);
              const doneInput = document.getElementById(self.doneSelector + i);
      
              if (taskSelect && descriptionInput) {
                taskSelect.innerHTML = weekData.tasks[i];
                descriptionInput.innerHTML = weekData.descriptions[i];
                doneInput.checked = (weekData.dones[i] === "true")? true: false;
              }
            }
          }
        });
      }
  }