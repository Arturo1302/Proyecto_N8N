/* script.js */

// ============================================================
// REFERENCIAS AL DOM
// ============================================================
var form        = document.getElementById('absenceForm');
var btnSubmit   = document.getElementById('btnSubmit');
var btnText     = document.getElementById('btnText');
var btnSpinner  = document.getElementById('btnSpinner');
var responseMsg = document.getElementById('response-msg');

// Campos del formulario
var nameInput        = document.getElementById('name');
var idInput          = document.getElementById('id');
var emailInput       = document.getElementById('email');
var reasonSelect     = document.getElementById('reason');
var otherReasonGroup = document.getElementById('otherReasonGroup');
var otherReasonInput = document.getElementById('otherReason');
var fileInput        = document.getElementById('supportFile');
var fileDrop         = document.getElementById('fileDrop');
var fileLabel        = document.getElementById('fileLabel');

// Tipos de archivo permitidos
var ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
var MAX_SIZE_MB   = 5;
var MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;


// ============================================================
// MOSTRAR/OCULTAR CAMPO "OTRO MOTIVO"
// ============================================================
reasonSelect.addEventListener('change', function () {
  if (this.value === 'other') {
    // Muestra el campo adicional
    otherReasonGroup.classList.remove('hidden');
    otherReasonInput.focus();
  } else {
    // Oculta y limpia el campo adicional
    otherReasonGroup.classList.add('hidden');
    otherReasonInput.value = '';
    clearError(otherReasonInput, 'otherReason-error');
  }
});


// ============================================================
// ZONA DE ARRASTRE DE ARCHIVOS (drag & drop)
// ============================================================

// Cuando el usuario arrastra un archivo sobre la zona
fileDrop.addEventListener('dragover', function (e) {
  e.preventDefault();
  fileDrop.classList.add('drag-over');
});

// Cuando el cursor sale de la zona
fileDrop.addEventListener('dragleave', function () {
  fileDrop.classList.remove('drag-over');
});

// Cuando suelta el archivo
fileDrop.addEventListener('drop', function (e) {
  e.preventDefault();
  fileDrop.classList.remove('drag-over');

  var droppedFile = e.dataTransfer.files[0];
  if (droppedFile) {
    // Asigna el archivo al input real
    var dt = new DataTransfer();
    dt.items.add(droppedFile);
    fileInput.files = dt.files;
    updateFileLabel(droppedFile.name);
  }
});

// Cuando selecciona mediante el explorador de archivos
fileInput.addEventListener('change', function () {
  if (this.files.length > 0) {
    updateFileLabel(this.files[0].name);
  }
});

// Actualiza el texto visible en la zona de carga
function updateFileLabel(filename) {
  fileLabel.innerHTML = '📎 <strong>' + filename + '</strong>';
}


// ============================================================
// UTILIDADES DE ERROR
// ============================================================

// Muestra un mensaje de error debajo del campo
function showError(input, errorId, message) {
  var errorSpan = document.getElementById(errorId);
  errorSpan.textContent = message;
  if (input) input.classList.add('invalid');
}

// Limpia el mensaje de error de un campo
function clearError(input, errorId) {
  var errorSpan = document.getElementById(errorId);
  errorSpan.textContent = '';
  if (input) input.classList.remove('invalid');
}

// Limpia todos los errores del formulario
function clearAllErrors() {
  clearError(nameInput,        'name-error');
  clearError(idInput,          'id-error');
  clearError(emailInput,       'email-error');
  clearError(reasonSelect,     'reason-error');
  clearError(otherReasonInput, 'otherReason-error');
  clearError(null,             'file-error');
}

// Muestra el mensaje de respuesta general (éxito o error)
function showResponseMsg(type, message) {
  responseMsg.className = 'response-msg ' + type;
  responseMsg.textContent = message;
  responseMsg.classList.remove('hidden');
  // Scroll suave hacia el mensaje
  responseMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResponseMsg() {
  responseMsg.classList.add('hidden');
  responseMsg.className = 'response-msg hidden';
}


// ============================================================
// VALIDACIONES
// ============================================================

// Valida que el email tenga formato correcto
function isValidEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// Valida todos los campos y devuelve true si todo es correcto
function validateForm() {
  var isValid = true;

  // --- Nombre ---
  if (nameInput.value.trim() === '') {
    showError(nameInput, 'name-error', 'El nombre completo es obligatorio.');
    isValid = false;
  } else {
    clearError(nameInput, 'name-error');
  }

  // --- Número de identificación ---
  if (idInput.value.trim() === '') {
    showError(idInput, 'id-error', 'El número de identificación es obligatorio.');
    isValid = false;
  } else {
    clearError(idInput, 'id-error');
  }

  // --- Email ---
  if (emailInput.value.trim() === '') {
    showError(emailInput, 'email-error', 'El correo electrónico es obligatorio.');
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, 'email-error', 'Ingresa un correo electrónico válido.');
    isValid = false;
  } else {
    clearError(emailInput, 'email-error');
  }

  // --- Motivo ---
  if (reasonSelect.value === '') {
    showError(reasonSelect, 'reason-error', 'Selecciona un motivo de inasistencia.');
    isValid = false;
  } else {
    clearError(reasonSelect, 'reason-error');

    // Si seleccionó "Otro", valida el campo adicional
    if (reasonSelect.value === 'other' && otherReasonInput.value.trim() === '') {
      showError(otherReasonInput, 'otherReason-error', 'Especifica el motivo de la inasistencia.');
      isValid = false;
    } else {
      clearError(otherReasonInput, 'otherReason-error');
    }
  }

  // --- Archivo ---
  if (fileInput.files.length === 0) {
    showError(null, 'file-error', 'Debes adjuntar un documento de soporte.');
    fileDrop.style.borderColor = 'var(--error)';
    isValid = false;
  } else {
    var file = fileInput.files[0];

    // Valida el tipo de archivo
    if (ALLOWED_TYPES.indexOf(file.type) === -1) {
      showError(null, 'file-error', 'Solo se permiten archivos PDF, JPG o PNG.');
      fileDrop.style.borderColor = 'var(--error)';
      isValid = false;

    // Valida el tamaño del archivo
    } else if (file.size > MAX_SIZE_BYTES) {
      showError(null, 'file-error', 'El archivo supera el límite de ' + MAX_SIZE_MB + ' MB.');
      fileDrop.style.borderColor = 'var(--error)';
      isValid = false;

    } else {
      clearError(null, 'file-error');
      fileDrop.style.borderColor = '';
    }
  }

  return isValid;
}


// ============================================================
// CONTROL DEL BOTÓN (estado de carga)
// ============================================================

function setLoading(isLoading) {
  if (isLoading) {
    btnSubmit.disabled = true;
    btnText.textContent  = 'Procesando...';
    btnSpinner.classList.remove('hidden');
  } else {
    btnSubmit.disabled = false;
    btnText.textContent  = 'Enviar Solicitud';
    btnSpinner.classList.add('hidden');
  }
}


// ============================================================
// ENVÍO DEL FORMULARIO
// ============================================================
/* ============================================================
CAMBIA SOLO LA PARTE DE ENVÍO DEL FORMULARIO
REEMPLAZA DESDE:
form.addEventListener('submit'...
HASTA EL FINAL DE ESE BLOQUE
============================================================ */

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  hideResponseMsg();
  clearAllErrors();

  if (!validateForm()) return;

  setLoading(true);

  try {

    // 🔥 AHORA USAMOS FORMDATA PARA ENVIAR ARCHIVO BINARIO
    var formData = new FormData();

    formData.append('name', nameInput.value.trim());
    formData.append('id', idInput.value.trim());
    formData.append('email', emailInput.value.trim());
    formData.append('reason', reasonSelect.value);

    formData.append(
      'otherReason',
      reasonSelect.value === 'other'
        ? otherReasonInput.value.trim()
        : ''
    );

    // 🔥 ARCHIVO REAL (PDF/JPG/PNG)
    formData.append('supportFile', fileInput.files[0]);

    var response = await fetch(
      'https://arturo1302.app.n8n.cloud/webhook-test/formulario',
      {
        method: 'POST',
        body: formData
      }
    );

    var text = await response.text();

    if (response.ok) {

      showResponseMsg(
        'success',
        '✔ Solicitud enviada correctamente.'
      );

      form.reset();

      fileLabel.innerHTML =
        'Arrastra un archivo o <strong>haz clic aquí</strong>';

      otherReasonGroup.classList.add('hidden');
      fileDrop.style.borderColor = '';

    } else {
      throw new Error(text || 'Error al enviar.');
    }

  } catch (error) {

    showResponseMsg(
      'error',
      '✖ Error de conexión con el servidor.'
    );

  } finally {
    setLoading(false);
  }
});
// ============================================================
// LIMPIAR ERROR EN TIEMPO REAL (mientras el usuario escribe)
// ============================================================

nameInput.addEventListener('input', function () {
  if (this.value.trim() !== '') clearError(this, 'name-error');
});

idInput.addEventListener('input', function () {
  if (this.value.trim() !== '') clearError(this, 'id-error');
});

emailInput.addEventListener('input', function () {
  if (isValidEmail(this.value)) clearError(this, 'email-error');
});

otherReasonInput.addEventListener('input', function () {
  if (this.value.trim() !== '') clearError(this, 'otherReason-error');
});
