// components-renderer.js is of type module, so we can use "await" in it.

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
    textInput.placeholder = "Label Placeholder";

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
    textareaInput.placeholder = "Optional Text Placeholder";

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

  return div; 
};


// get the component container, this is where the form will be added
let componentContainer = document.getElementById("component-container");
let addComponentButton = document.getElementById("add-component");
let componentsWhereSend = false;

// create a form and insert into the DOM
const form = document.createElement('form');
form.setAttribute('id', "component-form");
// add the form to the component container
componentContainer.appendChild(form);


// The form will be finished with a menu selection from the user.
// The selection will be communicated via IPC from the main process
// to the renderer process and will be used to create the form element.
window.electronAPI.receiveComponentType((event, componentType) => {
  // We got a new elementtype, so we disable the button until the user
  // has add label text to the element
  addComponentButton.disabled = true;

  // Add a header to this element
  const elementHeader = document.createElement('h3');
  elementHeader.innerHTML = `${componentType} Element`;
  form.appendChild(elementHeader);
  
  // create new element with requested component type
  const newElement = createComponent(componentType);
  
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
    // enable the button if all inputs have valid text
    if( isEnabled ) {
      addComponentButton.disabled = false;
    } else {
      addComponentButton.disabled = true;
    }
  });

  // add the new element to the form
  form.appendChild(newElement);
  componentContainer.appendChild(form);
  
});

// wait for the user to submit the form
addComponentButton.addEventListener('click', async (event) => {
  event.preventDefault();

  if (componentsWhereSend) {
    // show a dialog to the user
    const dialogConfig = {
      type: 'info',
      buttons: ['Ok', 'Cancel'],
      cancelId: 1,
      defaultId: 0,
      title: 'Warning',
      message: 'You have already added components to the page. OK will add these components, Cancel will discard them and remove this window.',
    };
    const result = await window.electronAPI.openDialog('showMessageBox', dialogConfig);

    if (result.response === 1) {
      // send a message to the main renderer to close the window
      window.electronAPI.sendMessageToMain('closeComponentsWindow');

      return;
    }

    // reset the flag
    componentsWhereSend = false;
  }

  //get all new formelements
  const newFormElements = componentContainer.querySelectorAll('.form-element');
  // create an array to hold the new form elements
  const newFormElementsArray = [];
  // loop over the new form elements
  newFormElements.forEach(element => {

    // get the label input
    const label = element.querySelector('.element-label');
    // get the value input
    const value = element.querySelector('.element-value');

    // create a new form element object
    const newFormElement = {
      label: label.value,
      type: 'variable',
      widget: value.dataset.type,
      value: value.dataset.type === 'checkbox' ? value.checked : value.value,
    };

    // add the new form element to the array
    newFormElementsArray.push(newFormElement);
  });

  // send the new form elements to the main renderer
  window.electronAPI.sendToOtherRenderer('mainWindow', newFormElementsArray);

  // set the flag
  componentsWhereSend = true;
});

//receive a message from the main renderer
window.electronAPI.receiveMessage('to-componentsWindow', (message) => {
  
  if (message === 'windowClosed') {
    // the window was hidden, so we reset the form so next time the window is
    // shown, the form is empty
    // remove all form elements
    form.innerHTML = '';
    // reset the button
    addComponentButton.disabled = true;
    // reset the flag
    componentsWhereSend = false;
  }
});