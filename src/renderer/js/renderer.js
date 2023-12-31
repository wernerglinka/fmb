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
*/

/**
 * @function createFormElementFromSchema
 * @param {object} value 
 * @param {string} parent 
 * @returns a form element
 
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
*/

/**
 * @function renderMainForm
 * @param {array} schemas - an array of schemas
 * @param {string} formId - the id of the form
 * @description This function will build the main form and renders it to the DOM
 * @returns void
 
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
*/




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
  window.draggedElement = null;

  // Add a drag handle
  const dragHandle = document.createElement('span');
  dragHandle.classList.add('sort-handle');
  dragHandle.innerHTML = `
    <svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#FFFFFF" stroke-width="2">
          <circle cx="4" cy="11" r="1"></circle>
          <circle cx="4" cy="4" r="1"></circle>
          <circle cx="4" cy="18" r="1"></circle>
          <circle cx="10" cy="11" r="1"></circle>
          <circle cx="10" cy="4" r="1"></circle>
          <circle cx="10" cy="18" r="1"></circle>
        </g>
      </g>
    </svg>
  `;
  div.appendChild(dragHandle);

  
  if( type === 'text' ) {
    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Text Key<sup>*</sup></span>`;

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
    label.innerHTML = `<span>Textarea Key<sup>*</sup></span>`;

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
    labelText.innerHTML = `<span>Content</span>`;

    // create the textarea
    const textareaInput = document.createElement('textarea');
    textareaInput.classList.add('element-value', 'is-editor');
    textareaInput.dataset.type = "textarea";
    textareaInput.placeholder = "Start typing...";
    textareaInput.value = "";

    // create wrapper for input for styling
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(textareaInput);

    // add the input to the label element
    labelText.appendChild(inputWrapper);
    
    // add the label to the div
    div.appendChild(labelText);
  }

  if( type === 'markdown editor' ) {
    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Textarea Key<sup>*</sup></span>`;

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
    //labelText.innerHTML = `<span class="with-switch"><span class="label-text">Markdown content</span><span class="md-select-wrapper"><input type="checkbox" role="switch" class="md-select" checked /></span></span>`;
    labelText.innerHTML = `<span>Text content</span>`;
    
    // create the textarea
    const textareaInput = document.createElement('textarea');
    textareaInput.classList.add('element-value', 'is-editor');
    textareaInput.dataset.type = "textarea";
    textareaInput.placeholder = "Click to open editor";

    // show the editor when the textarea is in focus
    textareaInput.addEventListener('click', (e) => {
      const editorOverlay = document.getElementById('editorOverlay');
      editorOverlay.classList.add('show');

      window.textareaInput = e.target;

      console.log(window.mdeditor.value());
      // add value from the textarea to the editor
      window.mdeditor.value(e.target.value);
    });
 

    // create wrapper for input for styling
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(textareaInput);

    // add the input to the label element
    labelText.appendChild(inputWrapper);
    
    // add the label to the div
    div.appendChild(labelText);


    /**
     *  Create a textarea with editor
     */
    // check if #editorWrapper already exists
    const editorWrapper = document.getElementById('editorWrapper');
    if( !editorWrapper ) {
      // Add an overlay
      const editorOverlay = document.createElement('div');
      editorOverlay.id = "editorOverlay";
      // Add the editor textarea
      const easyMDEditor = document.createElement('textarea');
      easyMDEditor.id = "editorWrapper";
      // add the editor wrapper to the DOM
      editorOverlay.appendChild(easyMDEditor);
      document.body.appendChild(editorOverlay);
   
      // add the easyMDEditor
      window.mdeditor = new EasyMDE({element: easyMDEditor, autoDownloadFontAwesome: true});
  
      // add a button to the easyMDEitor to disable the inline markdown styles
      const disableMarkdownStyles = document.createElement('button');
      disableMarkdownStyles.id = "disableMarkdownStyles";
      disableMarkdownStyles.innerHTML = "Inline Styles";
      // add the button to the toolbar
      const toolbar = document.querySelector('.editor-toolbar');
      toolbar.appendChild(disableMarkdownStyles);

      // add eventlistener to the disableMarkdownStyles button
      disableMarkdownStyles.addEventListener('click', (e) => {
        e.target.classList.toggle('disabled');
        const codemirrorWrapper = document.querySelector('.CodeMirror');
        codemirrorWrapper.classList.toggle('disable-markdown-styles');
      });

      // add a close button
      const closeButton = document.createElement('div');
      closeButton.id = "closeEditor";
      closeButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#ffffff" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"> 
            <circle cx="11" cy="11" r="10"></circle>
            <line x1="14" y1="8" x2="8" y2="14"></line>
            <line x1="8" y1="8" x2="14" y2="14"></line>
          </g>
        </svg>
      `;
      editorOverlay.appendChild(closeButton);

      // add eventlistener to the close button
      closeButton.addEventListener('click', () => {
        // first move the editor value to the textarea
        window.textareaInput.value = window.mdeditor.value();
        editorOverlay.classList.remove('show');
      });
    }
  }

  if( type === 'checkbox' ) {
    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Checkbox Key<sup>*</sup></span>`;

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
    label.innerHTML = `<span>List Key<sup>*</sup></span>`;
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
    label.classList.add('object-name');
    label.innerHTML = `<span>Object Key<sup>*</sup></span>`;
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', "text");
    nameInput.placeholder = "Name Placeholder";
    label.appendChild(nameInput);

    const collapseIcon = document.createElement('span');
    collapseIcon.classList.add('collapse-icon');
    collapseIcon.innerHTML = `
      <svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
            <g stroke="#FFFFFF" stroke-width="2">
              <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
              <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
              <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
              <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
              <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
              <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
              <polyline id="Path" points="15 19 12 16 9 19"></polyline>
              <polyline id="Path" points="15 5 12 8 9 5"></polyline>
            </g>
          </g>
        </g>
      </svg>

      
      <svg class="collapsed viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
              <g transform="translate(2, 2)">
                  <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
                  <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
                  <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
                  <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
                  <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
                  <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
                  <polyline id="Path" points="13 17 10 20 7 17"></polyline>
                  <polyline id="Path" points="13 3 10 0 7 3"></polyline>
              </g>
          </g>
        </g>
      </svg>
    `;

    collapseIcon.addEventListener('click', (e) => {
      const collapseIcon = e.target.closest('.collapse-icon');
      const objectDropzone = collapseIcon.closest('.object-name').nextSibling;
      const isCollapsed = objectDropzone.classList.contains('is-collapsed');
      if( isCollapsed ) {
        objectDropzone.classList.remove('is-collapsed');
        collapseIcon.classList.remove('is-collapsed');
      } else {
        objectDropzone.classList.add('is-collapsed');
        collapseIcon.classList.add('is-collapsed');
      }
      
    });
    label.appendChild(collapseIcon);
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
    label.innerHTML = `<span>Array Key<sup>*</sup></span>`;
    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', "text");
    nameInput.placeholder = "Array Name";
    label.appendChild(nameInput);

    const collapseIcon = document.createElement('span');
    collapseIcon.classList.add('collapse-icon');
    collapseIcon.innerHTML = `
      <svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
            <g stroke="#FFFFFF" stroke-width="2">
              <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
              <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
              <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
              <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
              <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
              <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
              <polyline id="Path" points="15 19 12 16 9 19"></polyline>
              <polyline id="Path" points="15 5 12 8 9 5"></polyline>
            </g>
          </g>
        </g>
      </svg>

      
      <svg class="collapsed viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
              <g transform="translate(2, 2)">
                  <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
                  <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
                  <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
                  <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
                  <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
                  <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
                  <polyline id="Path" points="13 17 10 20 7 17"></polyline>
                  <polyline id="Path" points="13 3 10 0 7 3"></polyline>
              </g>
          </g>
        </g>
      </svg>
    `;

    collapseIcon.addEventListener('click', (e) => {
      const collapseIcon = e.target.closest('.collapse-icon');
      const objectDropzone = collapseIcon.closest('.object-name').nextSibling;
      const isCollapsed = objectDropzone.classList.contains('is-collapsed');
      if( isCollapsed ) {
        objectDropzone.classList.remove('is-collapsed');
        collapseIcon.classList.remove('is-collapsed');
      } else {
        objectDropzone.classList.add('is-collapsed');
        collapseIcon.classList.add('is-collapsed');
      }
    });
    label.appendChild(collapseIcon);
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
  
  //add the ADD button
  const addButton = document.createElement('div');
  addButton.classList.add('add-button', 'button');
  addButton.innerHTML = "+";
  buttonWrapper.appendChild(addButton);

  //add the DELETE button
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

/**
 * @function getUpdatedElement(prop)
 * @param {object} prop 
 * @returns updatedElement
 * @description This function will first create a new element and then updates
 *   element based on prop values
 */
function getUpdatedElement(prop) {
  // Build the new element...
  const newElement = createComponent(prop.type);
  // ...and update it with the field data
  const updatedElement = updateElement(newElement, prop);

  /*
    Add an eventlistener to the label input to enable the submit button when the 
    user has added text to the label input and all other label inputs have text
  */
  const newElementLabelInput = newElement.querySelector('.element-label, .object-name input');
  newElementLabelInput && newElementLabelInput.addEventListener('change', (e) => {
    const thisElement = e.target;

    // check if the input is valid, if not valid, show error message and disable the button
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

  return updatedElement;
}

/**
 * @function updateElement
 * @param {DOM Element} element 
 * @param {*} field 
 * @returns 
 */
function updateElement(element, field) {

  if (field.type === "checkbox") {
    // Update the checkbox state
    element.querySelector('.element-value').checked = field.value;
    // Update the label
    element.querySelector('.element-label').value = field.label;
  } // end checkbox
  
  if (field.type === "text" || field.type === "textarea" || field.type === "markdown editor") {
    // Update the text value
    element.querySelector('.element-value').value = field.value;
    // Update the label
    element.querySelector('.element-label').value = field.label;
    // Update the placeholder
    element.querySelector('.element-value').placeholder = field.placeholder;
  } // end text, textarea, markdown editor
  
  if (field.type === "simple list") { 
    // Update the label
    element.querySelector('.object-name input').value = field.label;
    /* 
      Update the list items
      A new element includes only 1 list item. We'll clone it and use it to
      add all items in the field.value array.
    */
    const listWrapper = element.querySelector('ul');
    const listItem = listWrapper.querySelector('li');
    // remove the existing list item
    listItem.remove();
    // add the new list items from the field.value array
    field.value.forEach(item => {
      const clonedListItem = listItem.cloneNode(true);
      clonedListItem.querySelector('input').value = item;
      listWrapper.appendChild(clonedListItem);
    });
  } // end simple list

  if (field.type === "object" || field.type === "array") {
    // Update the label
    element.querySelector('.object-name input').value = field.label;

    if( field.value.length > 0 ) {
      // Get a reference to the object dropzone
      const objectDropzone = element.querySelector('.dropzone');
      // Add the new object properties
      field.value.forEach(property => {
        // Build/update the new element...
        const updatedElement = getUpdatedElement(property);
        // ... and add it to the dropzone
        objectDropzone.appendChild(updatedElement);
      });
    }
  } // end object/array

  return element;
}

// Add drag and drop functionality to the form
function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.component);
  /* 
    Add the drag origin to the dragged element
    We may drag a new element token from the 'sidebar' to add an element to the form, OR
    we may drag an element in the 'dropzone' to a different dropzone location
  */
  let origin = "sidebar";

  // Find if an acestor with id 'dropzone' exists
  const dropzone = e.target.closest('.dropzone');
  origin = dropzone ? "dropzone" : origin;
  // Set the origin
  e.dataTransfer.setData("origin",  origin);

  // store the dragged element
  window.draggedElement = e.target;

}

/**
 * @function dragOver(e)
 * @param {event object} e 
 * @description This function will handle the dragover event. It will indicate
 *   drop space by inserting a drop-indicator temporarily
 */
function dragOver(e) {
  e.preventDefault();
  e.target.classList.add('dropzone-highlight');
  const dropzone = e.target.closest('.dropzone');
  const { closest, position } = getInsertionPoint(dropzone, e.clientY);

  if (closest) {
      if (position === 'before') {
        closest.style.marginBottom = "2rem";
      } else {
        if (closest.nextSibling) {
          closest.nextSibling.style.marginTop = "2rem";
        }  
      }
  } else {
    dropzone.childNodes.forEach(child => {
      child.style.margin = "0.5rem 0";
    });
  }
}

function dragLeave(e) {
  const dropzone = e.target.closest('.dropzone');
  e.target.classList.remove('dropzone-highlight');

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach(child => {
    child.style.margin = "0.5rem 0";
  });
}

/**
 * @function getInsertionPoint
 * @param {*} container - The drop container element in which a dragged element is being dropped
 * @param {*} y - The vertical position of the mouse cursor at the time of the drop, typically provided by e.clientY from the drop event.
 * @returns The closest insertion point based on the cursor's position
 * @description This function will get the closest insertion point based on the cursor's position
 * during a drag/drop operation. The insertion point is the element that is closest
 * to the cursor's position. The position is either before or after the element.
 */
function getInsertionPoint(container, y) {
  // 'closest' will hold a reference to the closest child element to the drop point
  let closest = null;
  // 'closestDistance' will hold the distance from the drop point to the closest child element
  let closestDistance = Infinity;

  //  Iterate over each child element of the container 
  Array.from(container.children).forEach(child => {
      // Get the position and size of the child element
      const box = child.getBoundingClientRect();
      /*
        Calculate the vertical offset between the center of the child element 
        and the drop point. E.g., difference between the drop point and the 
        vertical midpoint of the child element (box.top + box.height / 2).
      */
      const offset = y - box.top - (box.height / 2);

      /* 
        Check if the absolute value of the offset for the current child element 
        is less than the closestDistance. If it is, this child element is closer 
        to the drop point than any previously checked elements. Then update 
        closest to reference this child element and closestDistance to the new 
        offset value.
      */
      if (Math.abs(offset) < Math.abs(closestDistance)) {
          closestDistance = offset;
          closest = child;
      }
  });

  /*
     Along with finding the closest child, we also determine whether the dragged
     element should be inserted before or after this child. This is decided 
     based on whether the offset is negative or positive, indicating the cursor's 
     position relative to the vertical center of the closest child.
     If offset is negative, the cursor is above the center, set position to 'before'.
     If offset is positive, the cursor is below the center, set position to 'after'.
  */

  /*
    Return an object containing:
    'closest': The closest child element to the drop point.
    'position': A string indicating whether the dragged element should be inserted 
    before or after the closest child ('before' or 'after').
  */
  return { closest, position: closestDistance < 0 ? 'before' : 'after' };
}

/**
 * @function convertToSchemaObject
 * @param {*} jsObject 
 * @returns 
 * @description This function will convert a JavaScript object into a schema object
 *  that can be used to create form elements.
 */
function convertToSchemaObject(jsObject) {
  function createSchemaField(key, value) {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      // It's an object, recurse
      return {
        label: key,
        type: 'object',
        value: Object.entries(value).map(([subKey, subValue]) => createSchemaField(subKey, subValue))
      };
    } else {
      // It's a primitive value or an array
      // analyse the typeof the value to determine the type of the element
      if( Array.isArray(value) ) {
        return {
          label: key,
          type: 'array',
          value: value.map(item => createSchemaField(key, item))
        };
      };
      if( typeof value === 'boolean' ) {
        return {
          label: key,
          type: 'checkbox',
          value: value,
          placeholder: `Add ${key}`
        };
      };
      if( typeof value === 'string' ) {
        return {
          label: key,
          type: typeof value === 'string' && value.includes('\n') ? 'textarea' : 'text',
          value: value,
          placeholder: `Add ${key}`
        };
      };
      
      if( typeof value === 'number' ) {
        return {
          label: key,
          type: 'text',
          value: value,
          placeholder: `Add ${key}`
        };
      };
    }
  }
  return {
      fields: Object.entries(jsObject).map(([key, value]) => createSchemaField(key, value))
  };
}

/**
 * @function processSchemaFile
 * @param {*} files
 * @param {*} dropzone
 * @description This function will process the schema files dropped into the dropzone 
 * Get the files from the clipboard
 * We are using the HTML5 FileReader API to read the contents of schema files 
 * enables web applications to asynchronously read the contents of files 
 * (or raw data buffers) stored on the user's computer, using JavaScript.
 */
async function processSchemaFile(files, dropzone, e) {
  // cache the parent clientY
  const parentClientY = e.clientY;
  
  for (const file of files) {
    // check file extension, exclude non-JSON files
    if( file.name.split('.').pop() === 'json' ) {
      // read the file
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (e) => {
        const schema = JSON.parse(e.target.result);
        // create form inputs from the schema fields

        const tempWrapper = document.createElement('div');
        schema.fields.forEach(field => {
          // create a new element
          const schemaElement = getUpdatedElement(field);
          // Append the new element to the tempWrapper
          tempWrapper.appendChild(schemaElement);
        });

        // Append the new element to the receiving dropzone
        const { closest, position } = getInsertionPoint(dropzone, parentClientY);
        if (closest) {
          if (position === 'before') {
            dropzone.insertBefore(tempWrapper, closest);
          } else {
            dropzone.insertBefore(tempWrapper, closest.nextSibling);
          }
        } else {
          dropzone.appendChild(tempWrapper);
        }
        
        updateButtonsStatus();
      };
      reader.onerror = (e) => {
        console.log(`Error reading file: ${e.target.error.code}`);
      };
    };

    if( file.name.split('.').pop() === 'md' ) {
      const frontmatterObject = await window.electronAPI.getJSObject(file.path);
        console.log("Received YAML object:", frontmatterObject);
        // the frontmatterObject is the result of parsing the Markdown file's
        // fontmatter YAML and converting it to a JavaScript object
        // Parse frontmatterObject and convert into a schema object

        const schema =  convertToSchemaObject(frontmatterObject);

        console.log(JSON.stringify(schema, null, 2));

        const tempWrapper = document.createElement('div');
        schema.fields.forEach(field => {
          // create a new element
          const schemaElement = getUpdatedElement(field);
          // Append the new element to the tempWrapper
          tempWrapper.appendChild(schemaElement);
        });

        // Append the new element to the receiving dropzone
        const { closest, position } = getInsertionPoint(dropzone, parentClientY);
        if (closest) {
          if (position === 'before') {
            dropzone.insertBefore(tempWrapper, closest);
          } else {
            dropzone.insertBefore(tempWrapper, closest.nextSibling);
          }
        } else {
          dropzone.appendChild(tempWrapper);
        }
        
        updateButtonsStatus();

    };
  }
};

/**
 * @function processSidebarDraggables
 * @param {*} e 
 * @param {*} component 
 * @param {*} dropzone
 * @description This function will process the sidebar draggables
 */
function processSidebarDraggables(e, component) {
  const dropzone = e.target.closest('.dropzone');
  if (!dropzone) return;

  // Create new element with requested component type
  const newElement = createComponent(component);

  // If an object is placed in an array dropzone, hide the label input
  // since the object will not need a name
  if( component === "object" && e.target.dataset.wrapper === "is-array" ) {
    const labelInput = newElement.querySelector('.object-name');
    
    // check if any objects already exists in the array dropzone
    // to avoid duplicate names. E.g. we will generate  'neverMind1', 'neverMind2', etc.
    const objectsInArray = e.target.querySelectorAll('.object-name');
    const objectIndex = objectsInArray.length;
    labelInput.querySelector('input').value = `neverMind${objectIndex + 1}`; // something for the loopstack
    labelInput.style.display = "none";
  }

  /*
    Add an eventlistener to the label input to enable the button when the user
    has added text to the label input and all other label inputs have text
  */
  const newElementLabelInput = newElement.querySelector('.element-label, .object-name input');
  newElementLabelInput && newElementLabelInput.addEventListener('change', (e) => {
    const thisElement = e.target;

    // check if the input is valid, if not valid, show error message and disable the button
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

  /*
    To insert the dragged element either before or after an existing element 
    in the drop container, including the ability to insert before the first 
    element, we need to determine the relative position of the cursor to the 
    center of each potential sibling element. This way, we can decide whether 
    to insert the dragged element before or after each child based on the 
    cursor's position.
  */
  const { closest, position } = getInsertionPoint(dropzone, e.clientY);
  if (closest) {
      if (position === 'before') {
          dropzone.insertBefore(newElement, closest);
      } else {
          dropzone.insertBefore(newElement, closest.nextSibling);
      }
  } else {
      dropzone.appendChild(newElement);
  }

  updateButtonsStatus();
};

/**
 * @function moveElement
 * @param {*} e 
 * @param {*} dropzone 
 * @description This function will move an existing element within or between drop zones
 *   To insert the dragged element either before or after an existing element 
 *   in the drop container, including the ability to insert before the first 
 *   element, we need to determine the relative position of the cursor to the 
 *   center of each potential sibling element. This way, we can decide whether 
 *   to insert the dragged element before or after each child based on the 
 *   cursor's position.
 */
function moveElement(e) {
  const dropzone = e.target.closest('.dropzone');
  if (!dropzone) return;

  const { closest, position } = getInsertionPoint(dropzone, e.clientY);
  if (closest) {
      if (position === 'before') {
          dropzone.insertBefore(window.draggedElement, closest);
      } else {
          dropzone.insertBefore(window.draggedElement, closest.nextSibling);
      }
  } else {
      dropzone.appendChild(window.draggedElement);
  }
  window.draggedElement = null; // Clear the reference
};

/**
 * @function drop
 * @param {*} event 
 * @description This function will handle the drop event. 
 * There are three scenarios to handle during a drop event:
 *  1. Dragging a schema file into the drop zone
 *  2. Dragging a new element from the sidebar to the drop zone
 *  3. Moving an existing element within or between drop zones
 */
async function drop(e) {
  e.preventDefault();
  e.stopPropagation();

  const dropzone = e.target.closest('.dropzone');
  if (!dropzone) return;

  // Remove highlight class from the event target, which indicates a valid drop target during the dragover event.
  dropzone.classList.remove('dropzone-highlight');

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach(child => {
    child.style.margin = "0.5rem 0";
  });

  // get the origin of the dragged element
  const origin = e.dataTransfer.getData("origin");

  /*
    1. Check if we dragged schema files into the dropzone
  */
  const hasFiles = e.dataTransfer.types.includes('Files');

  if (hasFiles) {
    const files = e.dataTransfer.files;
    await processSchemaFile(files, dropzone, e);
    return;
  }

  /*
    2. Dragging a new element from the sidebar to the drop zone
  */
  if (origin === "sidebar") {
    /*
      After receiving an component token from the sidebar, we need to create a 
      new element that represents the component type from the dataTransfer object.
    */
    const component = e.dataTransfer.getData("text/plain");
    processSidebarDraggables(e, component);

  } else {
    /*
      3. Moving an existing element within or between drop zones
    */
      moveElement(e);
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

  //console.log(`hasSchemaFields: ${hasSchemaFields}`);
  //console.log(`hasValidLabelInputs: ${hasValidLabelInputs}`);
  //console.log(`hasLabelInputs: ${hasLabelInputs}`);

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
    "markdown editor",
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
    function buttonClickHandler(e) {
      const clickedButton = e.target;
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

/**
 * @function renderMainWindow
 * @param {*} howToProceed
 * @returns void
 */
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
   * Prepare the form for the drag and drop functionality by adding a dropzone
   * We'll also add a button wrapper to hold all buttons for the form
   */
  // Add the dropzone to the form
  const dropzone = document.createElement('div');
  dropzone.id = 'dropzone';
  dropzone.classList.add('dropzone');
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

  updateButtonsStatus();

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