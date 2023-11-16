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
  const schemas = document.getElementById('existing-schemas');
  const hasSchemas = schemas ? schemas.querySelectorAll('.form-element').length > 0 : false;
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

  //console.log(`formDataObj: ${JSON.stringify(formDataObj)}`);

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

  let elementModifier = null;
  if( type === "object" ) { elementModifier = "is-object"; }
  if( type === "array" ) { elementModifier = "is-array"; }
  if( type === "simple list" ) { elementModifier = "is-list"; }

  div.classList.add('form-element');
  elementModifier && div.classList.add(elementModifier);

  // Make element draggable but nothing can be dropped into it
  div.setAttribute('draggable', true);
  div.classList.add('no-drop');
  div.addEventListener('dragstart', dragStart);
  // Temp element storage so I know what type of element I'm dragging
  let draggedElement = null;

  // Add a drag handle
  const dragHandle = document.createElement('span');
  dragHandle.classList.add('sort-handle');
  dragHandle.innerHTML = `
    <svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
            <g id="Artboard" stroke="#FFFFFF" stroke-width="2">
                <circle id="Oval" cx="4" cy="11" r="1"></circle>
                <circle id="Oval" cx="4" cy="4" r="1"></circle>
                <circle id="Oval" cx="4" cy="18" r="1"></circle>
                <circle id="Oval" cx="10" cy="11" r="1"></circle>
                <circle id="Oval" cx="10" cy="4" r="1"></circle>
                <circle id="Oval" cx="10" cy="18" r="1"></circle>
            </g>
        </g>
    </svg>
  `;
  div.appendChild(dragHandle);

  
  if( type === 'text' ) {
    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Text Label<sup>*</sup></span>`;

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
    labelText.innerHTML = `<span>Text for Text element</span>`;

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
    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Textarea Label<sup>*</sup></span>`;

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
    labelText.innerHTML = `<span>Text for Textarea element</span>`;

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
    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Checkbox Label<sup>*</sup></span>`;

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
    labelText.innerHTML = `<span>Initial state of checkbox</span>`;

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

  if( type === 'simple list' ) {
    // create the array name input
    const label = document.createElement('label');
    label.classList.add('object-name');
    label.innerHTML = `<span>List Name<sup>*</sup></span>`;
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', "text");
    nameInput.placeholder = "Name Placeholder";

    label.appendChild(nameInput);
    div.appendChild(label);

    // create the first list item input
    const textInput = document.createElement('input');
    textInput.setAttribute('type', "text");
    textInput.dataset.type = "text";
    textInput.classList.add('list-item');
    textInput.placeholder = "Item Placeholder";

    // create wrapper for input styling
    const listWrapper = document.createElement('ul');
    const listItem = document.createElement('li');
    listItem.appendChild(textInput);

    // add a button wrapper to the list item
    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('button-wrapper');
    listItem.appendChild(buttonWrapper);
    
    //add the list item add button
    const addListItem = document.createElement('div');
    addListItem.classList.add('add-button', 'button');
    addListItem.innerHTML = "+";
    buttonWrapper.appendChild(addListItem);
    
    //add the list item delete button
    const deleteListItem = document.createElement('div');
    deleteListItem.classList.add('delete-button', 'button');
    deleteListItem.innerHTML = "-";
    buttonWrapper.appendChild(deleteListItem);

    listItem.appendChild(buttonWrapper);
    listWrapper.appendChild(listItem);

    // add a eventlistener to the listWrapper to handle the add and delete buttons
/*
    listWrapper.addEventListener('click', (e) => {
      // if the add button was clicked clone the list item and add it to the list
      if( e.target.classList.contains('add-button') ) {
        const listItem = e.target.parentElement.parentElement.cloneNode(true);
        listWrapper.appendChild(listItem);
      }
      // if the delete button was clicked remove the list item from the list
      if( e.target.classList.contains('delete-button') ) {
        e.target.parentElement.parentElement.remove();
      }
    });
*/
    div.appendChild(listWrapper);
  }

  if( type === 'object' ) {
    // create the object name input
    const label = document.createElement('label');
    label.classList.add('object-name', 'not-required');
    label.innerHTML = `<span>Object Name<sup>*</sup></span>`;
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', "text");
    nameInput.placeholder = "Name Placeholder";

    label.appendChild(nameInput);

    div.appendChild(label);
    

    // create a dropzone for the object properties
    const objectDropzone = document.createElement('div');
    objectDropzone.classList.add('object-dropzone', 'dropzone');
    objectDropzone.dataset.wrapper = "is-object";
    objectDropzone.addEventListener("dragover", dragOver);
    objectDropzone.addEventListener("dragleave", dragLeave);
    objectDropzone.addEventListener("drop", drop);
    
    div.appendChild(objectDropzone);
  }

  if( type === 'array' ) {
    // create the array name input
    const label = document.createElement('label');
    label.classList.add('object-name');
    label.innerHTML = `<span>Array Name<sup>*</sup></span>`;
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', "text");
    nameInput.placeholder = "Array Name";

    label.appendChild(nameInput);

    div.appendChild(label);

    // create a dropzone for the array members
    const arrayDropzone = document.createElement('div');
    arrayDropzone.classList.add('array-dropzone', 'dropzone');
    arrayDropzone.dataset.wrapper = "is-array";
    arrayDropzone.addEventListener("dragover", dragOver);
    arrayDropzone.addEventListener("dragleave", dragLeave);
    arrayDropzone.addEventListener("drop", drop);
    
    div.appendChild(arrayDropzone);
  }
    
  // add a button wrapper to the element
  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('button-wrapper');
  div.appendChild(buttonWrapper);
  
  //add the add button
  const addButton = document.createElement('div');
  addButton.classList.add('add-button', 'button');
  addButton.innerHTML = "+";
  buttonWrapper.appendChild(addButton);

  //add the form-element delete button
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  deleteButton.innerHTML = "-";
  
  buttonWrapper.appendChild(deleteButton);

  document.getElementById('dropzone').addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    // if the add button was clicked clone the element and add it after the element
    if( e.target.classList.contains('add-button') ) {
      const clonedElement = e.target.parentElement.parentElement.cloneNode(true);
      e.target.parentElement.parentElement.after(clonedElement);
    }
    // if the delete button was clicked remove element
    if( e.target.classList.contains('delete-button') ) {
      e.target.parentElement.parentElement.remove();
    }
  });

  return div; 
};

// Add drag and drop functionality to the form
function dragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.component);
  // Add the drag origin to the dragged element
  // We may drag a new element token from the 'sidebar' to add an element to the form, OR
  // we may drag an element in the 'dropzone' to a different dropzone location
  let origin = "sidebar";

  // Find if an acestor with id 'dropzone' exists
  const dropzone = event.target.closest('.dropzone');
  origin = dropzone ? "dropzone" : origin;
  // Set the origin
  event.dataTransfer.setData("origin",  origin);

  // store the dragged element
  draggedElement = event.target;

}

function dragOver(event) {
  event.preventDefault();
  event.target.classList.add('dropzone-highlight');
}

function dragLeave(event) {
  event.target.classList.remove('dropzone-highlight');
}


function getInsertionPoint(container, y) {
  let closest = null;
  let closestDistance = Infinity;

  Array.from(container.children).forEach(child => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - (box.height / 2);

      if (Math.abs(offset) < Math.abs(closestDistance)) {
          closestDistance = offset;
          closest = child;
      }
  });

  return { closest, position: closestDistance < 0 ? 'before' : 'after' };
}





/**
 * @function drop
 * @param {*} event 
 * @description This function will handle the drop event. It will create a new element
 * in the receiving container with the dropped data
 */
function drop(event) {
  event.target.classList.remove('dropzone-highlight');
  event.preventDefault();
  event.stopPropagation();

  // determine if the dragged item is from the sidebar or the dropzone
  const origin = event.dataTransfer.getData("origin");

  if (origin === "sidebar") {
    // After receiving an element token from the sidebar, we need to create a new element
    // Get the component type from the dataTransfer object.
    const component = event.dataTransfer.getData("text/plain");

    // Create new element with requested component type
    const newElement = createComponent(component);

    // If an object is placed in an array dropzone, hide the label input
    // since the object will not need a name
    if( component === "object" && event.target.dataset.wrapper === "is-array" ) {
      const labelInput = newElement.querySelector('.object-name');
      
      // check if any objects already exists in the array dropzone
      // to avoid duplicate names. E.g. we will generate  'neverMind1', 'neverMind2', etc.
      const objectsInArray = event.target.querySelectorAll('.object-name');
      const objectIndex = objectsInArray.length;
      labelInput.querySelector('input').value = `neverMind${objectIndex + 1}`; // something for the loopstack
      labelInput.style.display = "none";
    }

    // Add an eventlistener to the label input to enable the button
    // when the user has added text to the label input and all other
    // label inputs have text
    const newElementLabelInput = newElement.querySelector('.element-label, .object-name input');
    newElementLabelInput && newElementLabelInput.addEventListener('change', (e) => {
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

    // Append the new item to the receiving container
    event.target.appendChild(newElement);

    updateButtonsStatus();

  } else {
    // Drag an element from the dropzone to a different dropzone location
    const dropZone = event.target.closest('.dropzone');
    if (!dropZone || !draggedElement) return;

    // Clone the dragged element and append to the drop zone
    //const clonedElement = draggedElement.cloneNode(true);
    //dropZone.appendChild(clonedElement);

    const { closest, position } = getInsertionPoint(dropZone, event.clientY);

    if (closest) {
        if (position === 'before') {
            dropZone.insertBefore(draggedElement, closest);
        } else {
            dropZone.insertBefore(draggedElement, closest.nextSibling);
        }
    } else {
        dropZone.appendChild(draggedElement);
    }


    // Optionally, remove the original element
    //draggedElement.remove();

    draggedElement = null; // Clear the reference

    
  }
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
  // NOTE: Object name inputs are not required to have text. When used in an array
  //an object may not need a name. This is up to the user.
  const allLabelInputs = document.querySelectorAll('.element-label, .object-name input:not(.not-required input)');
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
    hasValidLabelInputs = false;
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
  const dropzoneElements = dropzone.querySelectorAll('.form-element');
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
    "simple list",
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

      if( container.classList.contains('left-panel-open') ) {
        // Get the floating container position and width and set the float container
        // position to fixed so it will stay in place when the user scrolls
        setTimeout(() => {
          const floatContainer = document.getElementById('float-container');
          const floatContainerPosition = floatContainer.getBoundingClientRect();
          const floatContainerWidth = floatContainer.offsetWidth;

          floatContainer.style.position = "fixed";
          floatContainer.style.width = `${floatContainerWidth}px`;
          floatContainer.style.top = `${floatContainerPosition.top}px`;
          floatContainer.style.left = `${floatContainerPosition.left}px`;
        }, 500);
      } 
    });
  });

  // Add a visual placeholder for each component into the left panel
  const leftPanel = document.getElementById('component-selections');
  const floatContainer = document.createElement('div');
  floatContainer.id = 'float-container';

  availableComponents.forEach((component, index) => {
    const div = document.createElement('div');
    div.classList.add('component-selection', 'draggable');
    div.id = `component-${index}`;
    div.setAttribute('draggable', true);
    div.setAttribute('data-component', component);
    div.addEventListener('dragstart', dragStart);
    div.innerHTML = component;
    floatContainer.appendChild(div);
  });

  leftPanel.appendChild(floatContainer);
};

/**
 * @function getCurrentObject
 * @param {object} formObject 
 * @param {array} loopStack 
 * @returns {object} currentObject
 * @description getCurrentObject navigates through the nested formObject based on 
 * an array representing the path to traverse within this object and returns the
 * object at that specific location. 
 */
function getCurrentObject(formObject, loopStack) {
  let currentObject = formObject;
  for (let i = 0; i < loopStack.length - 1; i++) {
    let key = loopStack[i];
    if (!currentObject[key]) {
      currentObject[key] = {};
    }
    currentObject = currentObject[key];
  }
  return currentObject;
}

/**
 * @function processList
 * @param {*} listElement 
 * @returns key/value pair
 * @description Transforms a list element to a key/value pair, were the key is the
 *   list name and the value is an array of the list items
 */
function processList(listElement) {
  // get the list name
  key = listElement.querySelector('.object-name input').value;
  // get the list
  const listItems = listElement.querySelectorAll('li');
    const listItemsArray = [];
    listItems.forEach((item, index) => {
      listItemsArray.push(item.querySelector('input').value);
    });
  value = listItemsArray;

  return { key, value };
}


/**
 * @function transformFormElementsToObject
 * @param {Nodelist} allFormElements 
 * @returns {object} formObject
 * @description This function will transform the form elements to an 
 *   object which will be used to create the frontmatter YAML. The function
 *   uses a loopStack to keep track of the current object's depth. The loopStack is
 *   an array of strings. An array item is the name of the current object.
 *   The previous item in the array is the name of the parent object, etc. The
 *   first item in the array is the name of the main object. This approach is
 *   necessary to create the correct deep object structure.   
 */
function transformFormElementsToObject(allFormElements) {
  const numberOfFormElements = allFormElements.length;
  const loopStack = ["main"];
  const formObject = {};
  // Add object to formObject with name from loopStack. This is initially 
  // the main object, e.g. formObject.main = {}
  formObject[loopStack[0]] = {};
  let currentLevelObject;

  for (let i = 0; i < numberOfFormElements; i++) {
    const currentElement = allFormElements[i];

    // get status of the current element
    const isObject = currentElement.classList.contains('is-object');
    const isArray = currentElement.classList.contains('is-array');
    const isList = currentElement.classList.contains('is-list');
    const isLast = currentElement.classList.contains('is-last');
    const isLastInArray = currentElement.classList.contains('array-last');

    // check if the current element is an array or object. If so, add the name to the loopStack
    // as this represents a level in the object structure
    if (isObject || isArray) {
      const name = currentElement.querySelector('.object-name input').value;
      loopStack.push(name);

      // add an empty object to formObject with name from loopStack
      currentLevelObject = getCurrentObject(formObject, loopStack);
      currentLevelObject[loopStack[loopStack.length - 1]] = {};
    } 
    
    // process all simple prop elements
    else if (!isLast) {
      let key, value, widget;

      // A list is a simple prop variants
      if (isList) {
        const list = processList(currentElement);
        key = list.key;
        value = list.value;

      } else {
        // Get the element props
        key = currentElement.querySelector('.element-label').value;
        value = currentElement.querySelector('.element-value').value;
        widget = currentElement.querySelector('.element-value').type;
      }

      // Add the element to its parent object
      currentLevelObject = getCurrentObject(formObject,loopStack);
      currentLevelObject[loopStack[loopStack.length - 1]][key] = widget !== "checkbox" ? value : currentElement.querySelector('.element-value').checked;

    } else {
      // if the current element is the last in an array or object, remove the
      // parent name from the loopStack. This will move the currentLevelObject up one level
      currentLevelObject = getCurrentObject(formObject,loopStack);

      // remove the last item from the loopStack
      const parentName = loopStack.pop();

      /************************************************************************
        Objects when direct array children do not have a name to aid in the 
        conversion from object to YAML. This example shows the issue:
        
        NOTE: that initially we use a dummy name for the object, e.g. neverMind1, neverMind2, etc.
        so we can create the correct object structure. This dummy name will be removed later.
      
      {
        "layout": "sections",
        "draft": false,
        "sections": {
          "neverMind1": {
            "container": "article",
            "inContainer": true,
            "background": {
              "color": "#333",
              "image": ""
            }
          },
          "neverMind2": {
            "container": "aside",
            "inContainer": false,
            "background": {
              "color": "#333",
              "image": ""
            }
          }
        }
      }
      
      will be converted to this:
      NOTE: that the dummy name is removed and the object is converted to an array
      
      {
        "layout": "sections",
        "draft": false,
        "sections": [
          {
            "container": "article",
            "inContainer": true,
            "background": {
              "color": "#333",
              "image": ""
            }
          },
          {
            "container": "aside",
            "inContainer": false,
            "background": {
              "color": "#333",
              "image": ""
            }
          }
        ]
      }

      This will finally result in this YAML object:

      layout: sections
      draft: false
      sections:
        - container: article
          inContainer: true
          background:
            color: '#333'
            image: ''
        - container: aside
          inContainer: false
          background:
            color: '#333'
            image: ''

       *************************************************************************/

      // Check if the current element is the last in an array
      // if so, convert object props to array members
      if (isLastInArray) {
        const arrayVersion = [];
        Object.entries(currentLevelObject[parentName]).forEach(([key, value]) => {
          // if object, just push the value
          if (typeof value === 'object') {
            arrayVersion.push(value);
          } else {
            // if not object, create an object with the key and value and push it
            arrayVersion.push({ [key]: value });
          }
        });

        // replace the object with the array
        currentLevelObject[parentName] = arrayVersion;
      } 
    }
  };

  return formObject.main;
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
  dropzone.classList.add('dropzone', 'list-group');
  dropzone.addEventListener("dragover", dragOver);
  dropzone.addEventListener("dragleave", dragLeave);
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
    if ( dropzone ) {dropzone.innerHTML = ""};
    if ( schemaContainer ) {schemaContainer.innerHTML = ""};
    //mainForm.reset();

    updateButtonsStatus();
  });
  
  buttonWrapper.appendChild(clearAllButton);

  updateButtonsStatus();





  
/*
  // Add dragging/sorting functionality to the form
  let draggedElement = null;

  // Handle the drag start
  document.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('form-element')) {
      draggedElement = e.target;
    }
  });

  // Handle the drag over
  document.addEventListener('dragover', function(e) {
    e.preventDefault(); // Necessary to allow dropping
  });

  // Handle the drop
  document.addEventListener('drop', function(e) {
    e.preventDefault();
    if (!draggedElement) return;

    let dropTarget = e.target.closest('.object-dropzone, .dropzone');
    if (!dropTarget) {
      // If not over a dropzone or object-dropzone, ignore the drop
      return;
    }

    let afterElement = getDragAfterElement(dropTarget, e.clientY);

    if (afterElement) {
      dropTarget.insertBefore(draggedElement, afterElement);
    } else {
      // If no element is found to drop after, append to the end of the drop target
      dropTarget.appendChild(draggedElement);
    }

    draggedElement = null;
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.form-element:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2; // Distance from the center of the element

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
*/






  /**
   *  Listen for form submittion
   *  We'll have to preprocess form data that are added via the drag and drop
   *  functionality. We'll have to convert the form data to an object and then
   *  write it to a file.
   */ 
  mainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Preprocess form data in the dropzone
    const dropzone = document.getElementById('dropzone');

    // first we'll add an dummy element with an "is-last" class at the end of any 
    // dropzone. This will be used to build inner objects and arrays properly.
    const dummyElement = document.createElement('div');
    dummyElement.classList.add('form-element', 'is-last');
    dropzone.appendChild(dummyElement);
    
    const secondaryDropzones = dropzone.querySelectorAll('.object-dropzone, .array-dropzone');
    secondaryDropzones.forEach(dropzone => {
      // add a dummy is-last element at the end of the dropzone
      const dummyElement = document.createElement('div');
      dummyElement.classList.add('form-element', 'is-last');
      // if array dropzone add "array-last" class
      if( dropzone.classList.contains('array-dropzone') ) {
        dummyElement.classList.add('array-last');
      }
      dropzone.appendChild(dummyElement);
    });

    // Get all form-elements in the dropzone
    const allFormElements = dropzone.querySelectorAll('.form-element');
    // Transform the form elements to an object
    const dropzoneValues = transformFormElementsToObject(allFormElements);

    //console.log(JSON.stringify(dropzoneValues, null, 2));
    
    // Cleanup
    // Remove the dummy element so we can edit and use the form again
    const redundantDummyElements = document.querySelectorAll('.is-last');
    redundantDummyElements.forEach(element => {
      element.remove();
    });

    /**
     * Merge the schemas and dropzone values and write the resulting object to a file
     */ 
    const schemaValues = getSchemasObject();
    // merge the dropzone values with the schema values
    const pageObject = Object.assign({}, schemaValues, dropzoneValues);

    const pageYAMLObject = window.electronAPI.toYAML(pageObject);
    console.log(pageYAMLObject);

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