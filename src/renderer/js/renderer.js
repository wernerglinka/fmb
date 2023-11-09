/** 
 * @function isValidLabel
 * @param {string} label
 * @returns {boolean}
 * @description checks if the label is not empty and contains only letters and numbers
*/
function isValidLabel(label) {
  return /^[A-Za-z0-9]+$/.test(label);
}

function showErrorMessage(element, message) {
  element.classList.add('invalid');
  // insert error message into the dom
  const errorMessage = document.createElement('p');
  errorMessage.classList.add('error-message');
  errorMessage.innerHTML = message;
  // insert the error message after the input
  element.parentNode.insertBefore(errorMessage, element.nextSibling);
}

function removeErrorMessage(element) {
  // remove the invalid classe
  element.classList.remove('invalid');
  // remove the error message if it exists
  if( element.nextSibling.classList.contains('error-message') ) {
    element.nextSibling.remove();
  }
}
  
/**
 * @function renderSchema
 * @param {object} schema
 * @returns void
 */
function renderSchema(schema, form) {
  if (schema.label) {
    // create a fieldset for its values
    const fieldset = document.createElement('fieldset');
    // create a legend for the fieldset
    const legend = document.createElement('legend');
    legend.innerHTML = schema.label;
    fieldset.appendChild(legend);
    
    // create a form element for each value in the fieldset
    schema.values.forEach(value => {
      const formElement = createFormElementFromSchema(value, schema.label);
      // add the form element to the fieldset
      fieldset.appendChild(formElement);
    });

    // add the fieldset to the form
    form.appendChild(fieldset);

  } else {
    // create a 'stand-alone' form element for each value in the schema
    schema.values.forEach(value => {
      const formElement = createFormElementFromSchema(value, "");
      // add the form element to the form
      form.appendChild(formElement);
    });
  }
};


/**
 * @function createFormElementFromSchema
 * @param {object} value 
 * @param {string} parent 
 * @returns a form element
 */
function createFormElementFromSchema(value, parent) {
  // create a div to hold the form element
  const div = document.createElement('div');
  div.classList.add('form-element');

  // create the label
  const label = document.createElement('label');
  label.innerHTML = `<span>${value.label}</span>`;

  if (value.widget === 'text') {
    // create the input
    const input = document.createElement('input');
    input.setAttribute('type', "text");
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.setAttribute('value', value.value);
    input.placeholder = value.placeholder;

    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  if (value.widget === 'textarea') {
    // create the input
    const input = document.createElement('textarea');
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.innerHTML = value.value;
    input.placeholder = value.placeholder;

    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  if (value.widget === 'select') {
    // create the input
    const input = document.createElement('select');
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.innerHTML = value.value.map(option => `<option value="${option}">${option}</option>`).join('');
    
    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('select-wrapper');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  if (value.widget === 'checkbox') {
    // create the input
    const input = document.createElement('input');
    input.setAttribute('type', "checkbox");
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.setAttribute('role', 'switch');
    input.checked = value.value;

    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  // add the label to the div
  div.appendChild(label);

  return div;
}

/**
 * @function renderMainForm
 * @param {array} schemas - an array of schemas
 * @param {string} formId - the id of the form
 * @description This function will build the main form and renders it to the DOM
 * @returns void
 */
function renderMainForm(schemas) {
  const form = document.getElementById('main-form');

  // check if there are any schemas and render them first
  // used for page specific frontmatter components
  if(schemas.length > 0) {
    // add 'existing-schemas' container to the form
    const existingSchemasContainer = document.createElement('div');
    existingSchemasContainer.id = 'existing-schemas';
    form.appendChild(existingSchemasContainer);

    // parse the schemas string
    const availableSchemas = schemas.map(schema => JSON.parse(schema));

    // loop over the schemas and create a form element for each
    availableSchemas.forEach(schema => {
      renderSchema(schema, existingSchemasContainer);
    });
  }
};

/**
 * @function convertFormdataToObject
 * @param {object} flatValues - the object to create the object with
 * @description This function will create an object with the flatValues.
 * It will loop through the flatValues and create all properties of an object
 * @returns {object}
 */
function convertFormdataToObject(flatValues) {
  const pageObject = {};

  for (let key in flatValues) {
    if (flatValues.hasOwnProperty(key)) {
      let keys = key.replace(/\[(\d+)\]/g, '.$1').split('.'); // Convert 'prop[0]' to 'prop.0'
      let lastKey = keys.pop();
      let temp = pageObject;

      for (let k of keys) {
        // checks if the current key k is a string representing a positive integer 
        // (the regex ^\d+$ tests for one or more digits). If it is, k is converted 
        // to an actual number using parseInt(k).
        if (/^\d+$/.test(k)) k = parseInt(k); // Convert string number to integer

        // If temp[k] is undefined, it is initialized as either an array [] or an object {}, 
        // depending on the next key in the keys array. If the next key is a string representing 
        // a positive integer, temp[k] is initialized as an array []; otherwise, it's initialized 
        // as an object {}.
        if (typeof temp[k] === 'undefined') {
          temp[k] = /^\d+$/.test(keys[keys.indexOf(k) + 1]) ? [] : {}; // Initialize as array or object
        }

        // update temp to reference its own property temp[k], effectively moving 
        // one level deeper in the object structure for the next iteration.
        temp = temp[k];
      }

      // update the value of the pageObject at the last key with the value of the flatValues at the current key
      temp[lastKey] = flatValues[key];
    }
  }

  return pageObject;
}

/**
 * @function getSchemasObject
 * @description This function will get the form data from the schemas and convert it to an object
 * @returns the schema object
 */
function getSchemasObject() {
  const hasSchemas = document.getElementById('existing-schemas').querySelectorAll('.form-element').length > 0;
  if( !hasSchemas ) {
    return {};
  }
  // Get all form data from schemas manually since the form data object will not include
  // any unchecked checkboxes. If we use formData and then check for checkboxes, we will 
  // loose the order of object properties
  const allSchemaElements = document.querySelectorAll("#existing-schemas .form-element");
  const formDataObj = {};
  allSchemaElements.forEach(formElement => {
    const key = formElement.querySelector("input, textarea, select").name;
    const type = formElement.querySelector("input, textarea, select").type;
    const value = type !== 'checkbox' ? formElement.querySelector("input, textarea, select").value : formElement.querySelector("input").checked;
    formDataObj[key] = value;
  });

  // Create the schema object. This step will create a deep object, e.g. 
  // "seo.title": "My Title" will be converted to { seo: { title: "My Title" } }
  return convertFormdataToObject(formDataObj);

};

/**
 * @function createComponent
 * @param {string} type 
 * @returns a form element
 */
function createComponent(type) {
  // create a div to hold the form element
  const div = document.createElement('div');
  div.classList.add('compose', 'form-element');
  
  if( type === 'text' ) {
    /**
     * Create the text input object
     * {
     *   "label": "",
     *   "type": "variable",
     *   "widget": "text",
     *   "value": "",
     *   "placeholder": ""
     * } 
     */ 

    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Required label for Text element</span>`;

    // create the label input
    const labelInput = document.createElement('input');
    labelInput.setAttribute('type', "text");
    labelInput.classList.add('element-label');
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement('div');
    labelInputWrapper.appendChild(labelInput);

    // add the input to the label element
    label.appendChild(labelInputWrapper);
    
    // add the label to the div
    div.appendChild(label);
    
    // create the label for text input
    const labelText = document.createElement('label');
    labelText.innerHTML = `<span>Optional Text for Text element</span>`;

    // create the input
    const textInput = document.createElement('input');
    textInput.setAttribute('type', "text");
    textInput.dataset.type = "text";
    textInput.classList.add('element-value');
    textInput.placeholder = "Text Placeholder";

    // create wrapper for input for styling
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(textInput);

    // add the input to the label element
    labelText.appendChild(inputWrapper);
    
    // add the label to the div
    div.appendChild(labelText);
  }

  if( type === 'textarea' ) {
    /**
     * Create the text input object
     * {
     *   "label": "",
     *   "type": "variable",
     *   "widget": "textarea",
     *   "value": "",
     *   "placeholder": ""
     * } 
     */ 

    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Required label for Textarea element</span>`;

    // create the label input
    const labelInput = document.createElement('input');
    labelInput.setAttribute('type', "text");
    labelInput.classList.add('element-label');
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement('div');
    labelInputWrapper.appendChild(labelInput);

    // add the input to the label element
    label.appendChild(labelInputWrapper);
    
    // add the label to the div
    div.appendChild(label);
    
    // create the label for textarea
    const labelText = document.createElement('label');
    labelText.innerHTML = `<span>Optional Text for Textarea element</span>`;

    // create the textarea
    const textareaInput = document.createElement('textarea');
    textareaInput.classList.add('element-value');
    textareaInput.dataset.type = "textarea";
    textareaInput.placeholder = "Text Placeholder";

    // create wrapper for input for styling
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(textareaInput);

    // add the input to the label element
    labelText.appendChild(inputWrapper);
    
    // add the label to the div
    div.appendChild(labelText);
  }

  if( type === 'checkbox' ) {
    /**
     * Create the checkbox input object
     * {
     *   "label": "",
     *   "type": "variable",
     *   "widget": "checkbox",
     *   "value": "false",
     * } 
     */ 

    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Required label for Checkbox element</span>`;

    // create the label input
    const labelInput = document.createElement('input');
    labelInput.setAttribute('type', "text");
    labelInput.classList.add('element-label');
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement('div');
    labelInputWrapper.appendChild(labelInput);

    // add the input to the label element
    label.appendChild(labelInputWrapper);
    
    // add the label to the div
    div.appendChild(label);
    
    // create the label for checkbox
    const labelText = document.createElement('label');
    labelText.innerHTML = `<span>Initial state for element</span>`;

    // create the checkbox
    const checkboxInput = document.createElement('input');
    checkboxInput.value = "false";
    checkboxInput.classList.add('element-value');
    checkboxInput.dataset.type = "checkbox";
    checkboxInput.setAttribute('type', "checkbox");
    checkboxInput.setAttribute('role', "switch");

    // create wrapper for input for styling
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(checkboxInput);

    // add the input to the label element
    labelText.appendChild(inputWrapper);
    
    // add the label to the div
    div.appendChild(labelText);
  }

  if( type === 'object' ) {
    /**
     * Create a fieldset for the object
     */
    // create a div, representing the fieldset, to hold the object
    const objectWrapper = document.createElement('div');
    objectWrapper.classList.add('object-wrapper');

    // create the object name input
    const label = document.createElement('label');
    label.classList.add('object-name');
    label.innerHTML = `<span>Required Object name</span>`;
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', "text");
    nameInput.placeholder = "Object Name Placeholder";

    label.appendChild(nameInput);

    objectWrapper.appendChild(label);

    // create a dropzone for the object properties
    const objectDropzone = document.createElement('div');
    objectDropzone.classList.add('object-dropzone');
    objectDropzone.addEventListener("dragover", dragOver);
    objectDropzone.addEventListener("drop", drop);
    
    objectWrapper.appendChild(objectDropzone);

    div.appendChild(objectWrapper);
  }
    

  //add the delete button
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  deleteButton.innerHTML = "-";
  deleteButton.addEventListener('click', (e) => {
    e.target.parentElement.remove();
    updateButtonsStatus();
  });
  div.appendChild(deleteButton);

  return div; 
};

// Add drag and drop functionality to the form
function dragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.component);
}

function dragOver(event) {
  event.preventDefault();
}

/**
 * @function drop
 * @param {*} event 
 * @description This function will handle the drop event. It will create a new element
 * in the receiving container with the dropped data
 */
function drop(event) {
  event.preventDefault();
  event.stopPropagation();
  const component = event.dataTransfer.getData("text/plain");

  console.log(component);

  // create new element with requested component type
  const newElement = createComponent(component);
  
  if (component === 'text' || component === 'textarea' || component === 'checkbox') {
    // add an eventlistener to the label input to enable the button
    // when the user has added text to the label input and all other
    // label inputs have text
    const newElementLabelInput = newElement.querySelector('.element-label');
    newElementLabelInput.addEventListener('change', (e) => {
      const thisElement = e.target;

      // check if the input is valid
      // if not valid, show error message and disable the button
      if( !isValidLabel(thisElement.value) ) {
        showErrorMessage(thisElement, "Label must only use characters and numbers");
        updateButtonsStatus();
        return;
      }

      // remove error message if it exists
      if (thisElement.classList.contains('invalid')) {
        removeErrorMessage(thisElement);
      }

      updateButtonsStatus();
    });
  }

  // Append the new item to the receiving container
  event.target.appendChild(newElement);

  updateButtonsStatus();
}

/**
 * @function updateButtonsStatus
 * @description This function will update the status of the buttons
 * @returns void
 */
function updateButtonsStatus() {
  // update SUBMIT button status
  // SUBMIT button is disabled by default. It will be enabled when schema fields
  // exist, the user has added valid text to a label input in the dropzone and all 
  // other label inputs have valid text.
  const submitButton = document.getElementById('submit-primary');
  
  // check if any schemas are present
  let hasSchemaFields = false;
  const schemaWrapper = document.getElementById('existing-schemas');
  const schemaFields = schemaWrapper ? schemaWrapper.querySelectorAll('.form-element') : [];
  if( schemaFields.length > 0 ) {
    hasSchemaFields = true;
  }

  // loop over all label inputs in the dropzone and check if they have valid text.
  // If all have valid text, enable the SUBMIT button
  const allLabelInputs = document.querySelectorAll('.element-label');
  let hasValidLabelInputs = true;
  let hasLabelInputs = true;

  if (allLabelInputs.length > 0) {
    hasLabelInputs = true;
    // check if any input is empty
    allLabelInputs.forEach(input => {
      // check if the input is valid
      if( !isValidLabel(input.value.trim()) ) {
        hasValidLabelInputs = false;
      }
    });
  } else {
    hasLabelInputs = false;
  }

  // enable the SUBMIT button if all inputs have valid text
  if( (hasSchemaFields && hasValidLabelInputs) || 
      (!hasSchemaFields && hasValidLabelInputs) || 
      (hasSchemaFields && !hasLabelInputs)) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
  
  // update CLEAR DROPZONE button status
  // CLEAR DROPZONE button is disabled by default. It will be enabled when the user
  // has added elements to the dropzone and disabled when the dropzone is empty.
  const clearDropzoneButton = document.getElementById('clear-dropzone');
  const dropzone = document.getElementById('dropzone');
  const dropzoneElements = dropzone.querySelectorAll('.compose');
  if( dropzoneElements.length > 0 ) {
    clearDropzoneButton.disabled = false;
  } else {
    clearDropzoneButton.disabled = true;
  }

  // update CLEAR ALL button status
  // CLEAR ALL button is disabled by default. It will be enabled when the user
  // has added elements to the dropzone or schemas exist and disabled when the
  // dropzone and schemas are empty.
  const clearAllButton = document.getElementById('clear-all');
  const dropzoneIsEmpty = dropzoneElements.length === 0;
  const schemasIsEmpty = schemaFields.length === 0;
  if( dropzoneIsEmpty && schemasIsEmpty ) {
    clearAllButton.disabled = true;
  } else {
    clearAllButton.disabled = false;
  }
}

/**
 * @function addComponentsSidepanel
 * @description This function will add the components sidepanel to the DOM
 * The left panel holds all available components which may be dragged into the 
 * frontmatter pane. The left panel is hidden by default and can be toggled by
 * clicking the left panel icon to the right of the window title.
 */
function renderComponentsSidepanel() {
  const container = document.getElementById('working-pane');
  const leftPanelIcons = document.querySelectorAll('.left-panel');

  const availableComponents = [
    "text",
    "textarea",
    "checkbox",
    "object",
    "array"
  ];

  // Add event listeners to the left panel icons so they toggle their
  // open class and the left-panel-open class on the container
  leftPanelIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      // toggle the open class on the icons
      leftPanelIcons.forEach(i => i.classList.toggle('open'));
      // toggle the left-panel-open class on the container
      container.classList.toggle('left-panel-open');
    });
  });

  // Add a visual placeholder for each component into the left panel
  const leftPanel = document.getElementById('component-selections');
  availableComponents.forEach((component, index) => {
    const div = document.createElement('div');
    div.classList.add('component-selection', 'draggable');
    div.id = `component-${index}`;
    div.setAttribute('draggable', true);
    div.setAttribute('data-component', component);
    div.addEventListener('dragstart', dragStart);
    div.innerHTML = component;
    leftPanel.appendChild(div);
  });
};

/**
 * @function waitForHowToProceed
 * @returns a promise that resolves to the clicked button
 */
function waitForHowToProceed() {
  return new Promise((resolve) => {
    function buttonClickHandler(event) {
      const clickedButton = event.target;
      resolve(clickedButton);
    }
    const commonAncestor = document.getElementById('howToProceed');
    commonAncestor.addEventListener('click', buttonClickHandler);
  });
}

/**
 * @function renderWelcomeWindow
 * @returns a promise that resolves to the clicked button
 */
async function renderWelcomeWindow() {
  const mainWindow = document.body;
  mainWindow.classList.add('welcome');

  // Create the welcome window
  const welcomeWindow = document.createElement('div');
  welcomeWindow.classList.add('welcome-window');

  const welcomeContent = `
    <h1>Welcome to the Frontmatter Composer</h1>
    <ul id="howToProceed">
      <li>
        <a id="getSchema" data-proceed="getSchema">   
          <svg class="listIcon" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
              <g stroke="#ffffff" stroke-width="2">
                <g id="file-code" transform="translate(3, 3)">
                  <path d="M10.5,0 L2,0 C0.8954305,0 0,0.8954305 0,2 L0,18 C0,19.1045695 0.8954305,20 2,20 L14,20 C15.1045695,20 16,19.1045695 16,18 L16,5.5 L10.5,0 Z" id="Path"></path>
                  <polyline id="Path" points="10 0 10 6 16 6"></polyline>
                  <polyline id="Path" points="6 11 4 13 6 15"></polyline>
                  <polyline id="Path" points="10 15 12 13 10 11"></polyline>
                </g>
              </g>
            </g>
          </svg>
          Load a Schema to get going</a>
      </li>
      <li>
        <a id="fromScratch" data-proceed="fromScratch">
          <svg class="listIcon" viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
              <g stroke="#ffffff" stroke-width="2">
                <g id="list-plus" transform="translate(3, 2.5)">
                  <line x1="8" y1="6.5" x2="0" y2="6.5" id="Path"></line>
                  <line x1="13" y1="0.5" x2="0" y2="0.5" id="Path"></line>
                  <line x1="13" y1="12.5" x2="0" y2="12.5" id="Path"></line>
                  <line x1="15" y1="3.5" x2="15" y2="9.5" id="Path"></line>
                  <line x1="18" y1="6.5" x2="12" y2="6.5" id="Path"></line>
                </g>
              </g>
            </g>
          </svg>
          Build from Scratch</a></li>
    </ul>
    `;
  welcomeWindow.innerHTML = welcomeContent;
  mainWindow.appendChild(welcomeWindow);

  // wait for button click and then proceed
  const whatToDo = await waitForHowToProceed();

  if (whatToDo) {
    return whatToDo.dataset.proceed;
  } else {
    return "fromScratch";
  }
};


// Get the project schemas directory from the main process and then the schemas in the directory
// from the main process. Then build the form from the schemas.
// This part of the process is wrapped in an async function so we can use await
async function renderMainWindow(howToProceed) {
  const mainForm = document.getElementById('main-form');
  
  // remove the welcome window
  const welcomeWindow = document.querySelector('.welcome-window');
  welcomeWindow.remove();
  document.body.classList.remove('welcome');
  
  // Add the sidepanel with all available components
  renderComponentsSidepanel();

  /**
   * If getSchema was selected in the welcome window, we'll have to get the schemas
   * from the main process and start building the form from the schemas
   */
  if (howToProceed === "getSchema") {
    // Get the project schemas directory from the main process
    // the user will select the directory via a native dialog box
    const dialogConfig = {
      message: 'Select the Schemas Directory',
      buttonLabel: 'Select',
      properties: ['openDirectory']
    };
    const schemasDirectory = await window.electronAPI.openDialog('showOpenDialog', dialogConfig);
    
    // Get the schemas in the directory from the main process
    let schemas = [];
    if(schemasDirectory.filePaths[0] !== undefined) {
      schemas = await window.electronAPI.getSchemas(schemasDirectory.filePaths[0]);

      // Build the form from the schemas
      renderMainForm(schemas);
    }
  }

  /**
   * Prepare the form for the drag and drop functionality by adding a dropzone
   * We'll also add a button wrapper to hold all buttons for the form
   */
  // Add the dropzone to the form
  const dropzone = document.createElement('div');
  dropzone.id = 'dropzone';
  dropzone.classList.add('dropzone');
  dropzone.addEventListener("dragover", dragOver);
  dropzone.addEventListener("drop", drop);
  mainForm.appendChild(dropzone);

  // add a button wrapper to the form
  const buttonWrapper = document.createElement('div');
  buttonWrapper.id = 'button-wrapper';
  mainForm.appendChild(buttonWrapper);

  // Add the SUBMIT button
  const submitButton = document.createElement('button');
  submitButton.setAttribute('type', "submit");
  submitButton.id ='submit-primary';
  submitButton.classList.add('form-button');
  submitButton.innerHTML = "Submit";
  buttonWrapper.appendChild(submitButton);

  // Add a CLEAR DROPZONE button
  const clearDropzoneButton = document.createElement('button');
  clearDropzoneButton.classList.add('form-button');
  clearDropzoneButton.id ='clear-dropzone';
  clearDropzoneButton.disabled = true;
  clearDropzoneButton.innerHTML = "Clear Dropzone";
  clearDropzoneButton.addEventListener('click', (e) => {
    e.preventDefault();
    dropzone.innerHTML = "";
    updateButtonsStatus();
  });
  buttonWrapper.appendChild(clearDropzoneButton);

  // Add a CLEAR ALL button
  const schemaContainer = document.getElementById('existing-schemas');
  const clearAllButton = document.createElement('button');
  clearAllButton.classList.add('form-button');
  clearAllButton.id ='clear-all';
  clearAllButton.innerHTML = "Clear ALL";
  clearAllButton.addEventListener('click', (e) => {
    e.preventDefault();
    dropzone.innerHTML = "";
    schemaContainer.innerHTML = "";
    mainForm.reset();
    updateButtonsStatus();
  });
  
  buttonWrapper.appendChild(clearAllButton);

  updateButtonsStatus();


  /**
   *  Listen for form submittion
   *  We'll have to preprocess form data that are added via the drag and drop
   *  functionality. We'll have to convert the form data to an object and then
   *  write it to a file.
   */ 
  mainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // preprocess form data in the dropzone
    // form elements in the dropzone are composed from two input fields
    // one for the label and one for the value. We'll get the values
    // from the input fields and create an object from them
    const dropzone = document.getElementById('dropzone');
    const dropzoneElements = dropzone.querySelectorAll('.compose');
    const dropzoneValues = [];

    if( dropzoneElements.length > 0 ) {
      dropzoneElements.forEach(element => {
        const label = element.querySelector('.element-label').value;
        const value = element.querySelector('.element-value').value;
        const widget = element.querySelector('.element-value').dataset.type;

        dropzoneValues.push({
          [label]: widget !== "checkbox" ? value : element.querySelector('.element-value').checked
        });
      });
    }

    /**
     * Merge the schemas and dropzone values and write the resulting object to a file
     */
    const schemaValues = getSchemasObject();
    // merge the dropzone values with the schema values
    const pageObject = Object.assign({}, schemaValues, ...dropzoneValues);

    // send the page object to the main process
    window.electronAPI.writeObjectToFile(pageObject);
  });

};

/******************************************************************************
 * Main render process
 ******************************************************************************/
(mainRenderer = async () => {
  const howToProceed = await renderWelcomeWindow();

  renderMainWindow(howToProceed);
})();






