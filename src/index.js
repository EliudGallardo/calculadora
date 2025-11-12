import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../dist/public/css/main.css';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('operacionInput');
  const btnGenerar = document.getElementById('btnGenerar');
  const btnLimpiar = document.getElementById('btnLimpiar');
  const resultado = document.getElementById('resultado');
  const tipoOperacion = document.getElementById('tipoOperacion');
  const historial = document.getElementById('historial');

  let tempGlobal = 1;

  // Función que desglosa paso a paso
  function procesar(expresion) {
    let pasosLocales = "";
    let temp = tempGlobal;

    while (expresion.includes("(")) {
      const match = /\([^()]+\)/.exec(expresion);
      if (!match) break;
      const dentro = match[0].slice(1, -1);
      const resultadoDentro = procesar(dentro);
      expresion = expresion.replace(match[0], resultadoDentro.reemplazo);
      pasosLocales += resultadoDentro.pasos;
      tempGlobal = resultadoDentro.temp;
    }

    while (/[0-9.]+\/[0-9.]+/.test(expresion)) {
      const match = /([0-9.]+)\/([0-9.]+)/.exec(expresion);
      if (!match) break;
      const t = `t${tempGlobal++}`;
      pasosLocales += `${t} = ${match[1]} / ${match[2]}\n`;
      expresion = expresion.replace(match[0], t);
    }

    while (/\*/.test(expresion)) {
      const match = /([0-9.]+|\bt\d+\b)\*([0-9.]+|\bt\d+\b)/.exec(expresion);
      if (!match) break;
      const t = `t${tempGlobal++}`;
      pasosLocales += `${t} = ${match[1]} * ${match[2]}\n`;
      expresion = expresion.replace(match[0], t);
    }

    while (/[\+\-]/.test(expresion)) {
      const match = /([0-9.]+|\bt\d+\b)([\+\-])([0-9.]+|\bt\d+\b)/.exec(expresion);
      if (!match) break;
      const t = `t${tempGlobal++}`;
      pasosLocales += `${t} = ${match[1]} ${match[2]} ${match[3]}\n`;
      expresion = expresion.replace(match[0], t);
    }

    return { reemplazo: expresion, pasos: pasosLocales, temp: tempGlobal };
  }

  // Generar desglose
  btnGenerar.addEventListener('click', () => {
    const expr = input.value.trim();
    const tipo = tipoOperacion.value;

    if (expr === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Ups',
        text: 'Debes ingresar una operación matemática primero.',
      });
      return;
    }

    try {
      let salidaFinal = "";

      const calcular = (multiplicador, nombre) => {
        tempGlobal = 1;
        const exprMod = `(${expr})*${multiplicador}`;
        const res = procesar(exprMod);
        const resultadoFinal = eval(exprMod);

        return `
🔹 ${nombre.toUpperCase()}:
operación: ${exprMod}
--------------------------
${res.pasos}r = ${res.reemplazo}

Resultado final: ${resultadoFinal}\n`;
      };

      if (tipo === 'triplo') {
        salidaFinal = calcular(3, 'Triplo');
      } else if (tipo === 'cuadruplo') {
        salidaFinal = calcular(4, 'Cuádruplo');
      } else {
        salidaFinal = calcular(3, 'Triplo') + '\n' + calcular(4, 'Cuádruplo');
      }

      resultado.textContent = salidaFinal;
      resultado.classList.remove('d-none');

      // Agregar al historial
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.textContent = `${tipo.toUpperCase()} de ${expr}`;
      historial.prepend(li);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Revisa la operación. Ejemplo: 2*(3+4/2)',
      });
      resultado.classList.add('d-none');
    }
  });

  // Limpiar todo
  btnLimpiar.addEventListener('click', () => {
    input.value = '';
    resultado.textContent = '';
    resultado.classList.add('d-none');

    // Si también quieres limpiar el historial:
    historial.innerHTML = '';

    Swal.fire({
      icon: 'info',
      title: 'Limpieza completa',
      text: 'Se ha limpiado la operación y el resultado.',
      timer: 1500,
      showConfirmButton: false
    });
  });
});
