/** 
 * @function isValidLabel
 * @param {string} label
 * @returns {boolean}
 * @description checks if the label is not empty and contains only letters and numbers
*/
function isValidLabel(label) {
  return /^[A-Za-z0-9]+$/.test(label);
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
  const form = document.getElementById('existing-schemas');
  
  // check if there are any schemas and render them first
  // used for page specific frontmatter components
  if(schemas.length > 0) {
    // parse the schemas string
    const availableSchemas = schemas.map(schema => JSON.parse(schema));

    // loop over the schemas and create a form element for each
    availableSchemas.forEach(schema => {
      renderSchema(schema, form);
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

  //add the delete button
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  deleteButton.innerHTML = "-";
  deleteButton.addEventListener('click', (e) => {
    e.target.parentElement.remove();
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
  const component = event.dataTransfer.getData("text/plain");
  
  // Create a new element in the receiving container with the dropped data
  const newItem = document.createElement("div");
  newItem.textContent = component;
  newItem.classList.add('data-component', "draggable");
  newItem.draggable = true;

  // create new element with requested component type
  const newElement = createComponent(component);
  
  // add an eventlistener to the label input to enable the button
  // when the user has added text to the label input and all other
  // label inputs have text
  const newElementLabelInput = newElement.querySelector('.element-label');
  newElementLabelInput.addEventListener('change', (e) => {
    const thisElement = e.target;
    
    // check if the input is valid
    if( !isValidLabel(thisElement.value) ) {
      showErrorMessage(thisElement, "Label must only use characters and numbers");
      return;
    }

    // remove error message if it exists
    if (thisElement.classList.contains('invalid')) {
      removeErrorMessage(thisElement);
    }
    
    const allLabelInputs = document.querySelectorAll('.element-label');
    let isEnabled = true;
    
    // check if any input is empty
    allLabelInputs.forEach(input => {
      // check if the input is valid
      if( !isValidLabel(input.value.trim()) ) {
        isEnabled = false;
      }
    });

    /*
    // enable the button if all inputs have valid text
    if( isEnabled ) {
      addComponentButton.disabled = false;
    } else {
      addComponentButton.disabled = true;
    }
    */
  });

  // Append the new item to the receiving container
  event.target.appendChild(newElement);
}


/******************************************************************************
 * Main render process
 ******************************************************************************/

// Manage left panel visibility
// The left panel holds all available components which may be dragged into the 
// frontmatter pane. The left panel is hidden by default and can be toggled by
// clicking the left panel icon in the top left corner of the app.
const container = document.getElementById('working-pane');

const leftPanelIcons = document.querySelectorAll('.left-panel');
leftPanelIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    // toggle the open class on the icons
    leftPanelIcons.forEach(i => i.classList.toggle('open'));
    // toggle the left-panel-open class on the container
    container.classList.toggle('left-panel-open');
  });
});

// Define the available components
const availableComponents = [
  "text",
  "textarea",
  "checkbox",
  "object",
  "array"
];

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



// at this point the left panel is ready to be used. On to select the schemas directory


// Get the project schemas directory from the main process and then the schemas in the directory
// from the main process. Then build the form from the schemas.
// This part of the process is wrapped in an async function so we can use await
(async function mainRenderer() {
  // Get the project schemas directory from the main process
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
  }

  // Build the form from the schemas
  renderMainForm(schemas);

  // Add the dropzone to the form
  const dropzone = document.createElement('div');
  dropzone.id = 'dropzone';
  dropzone.classList.add('dropzone');
  dropzone.addEventListener("dragover", dragOver);
  dropzone.addEventListener("drop", drop);
  mainForm.appendChild(dropzone);

  // Add a clear-all button to dropzone
  const clearAllButton = document.createElement('button');
  clearAllButton.classList.add('form-button');
  clearAllButton.id ='clear-all';
  clearAllButton.innerHTML = "Clear Dropzone";
  clearAllButton.addEventListener('click', (e) => {
    e.preventDefault();
    dropzone.innerHTML = "";
  });
  mainForm.appendChild(clearAllButton);
  
})();








/**
 *  Listen for form submittion
 *  We'll have to preprocess form data that are added via the drag and drop
 *  functionality. We'll have to convert the form data to an object and then
 *  write it to a file.
 */ 
const mainForm = document.getElementById('main-form');
mainForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // preprocess form data in the dropzone
  const dropzone = document.getElementById('dropzone');
  const dropzoneElements = dropzone.querySelectorAll('.compose');
  const dropzoneValues = [];

  if( dropzoneElements.length > 0 ) {
    dropzoneElements.forEach(element => {
      const label = element.querySelector('.element-label').value;
      const value = element.querySelector('.element-value').value;
      const placeholder = element.querySelector('.element-value').placeholder;
      const widget = element.querySelector('.element-value').dataset.type;

      console.log(value);

      dropzoneValues.push({
        [label]: widget !== "checkbox" ? value : element.querySelector('.element-value').checked
      });
    });
  }

  // get form data from the schemas
  const schemaValues = getSchemasObject();

  // merge the dropzone values with the schema values
  const pageObject = Object.assign({}, schemaValues, ...dropzoneValues);

  console.log(JSON.stringify(pageObject, null, 2));

  // send the page object to the main process
  window.electronAPI.writeObjectToFile(pageObject);
});