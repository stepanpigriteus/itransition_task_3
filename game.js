const crypto = require('crypto');
const readline = require('readline');
const Table = require('cli-table3');

class Game {
    params() {
        let variantes = process.argv.slice(2);
        if (variantes.length >= 3 && variantes.length % 2 !== 0) {
            if (this.isUnique(variantes)) {
                let sk = SecretKeyGenerator.secretKeyGen(); 
                let turn = SecretKeyGenerator.turnGenerator(variantes); 
                console.log('HMAC: ' + HmacGenerator.hmacGenerator(turn, sk)); 
                let x = ResultMatrixGenerator.resultMatrix(variantes);
                const movesForTable = x.slice(0, x.length - 2).map(element => element.slice(6));
                console.log('Available moves:' + x + '\n' + 'Enter your move:'); 
                UserInterface.userInterface(variantes, turn, sk, movesForTable); 
            } else {
                console.log("please enter unique names");
            }
        } else {
            console.log("Please enter more than 3 (an odd number of 3,5,7, etc.) choices, for example: 'Rock Paper Scissors'");
        }
    }

    isUnique(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr.indexOf(arr[i]) != i) return false;
        }
        return true;
    }
}

class ResultMatrixGenerator {
    static resultMatrix(arr) {
        let menuObj = {};
        let movesArr = [];
        for (let i = 0; i < arr.length; i++) {
            menuObj[i + 1] = arr[i];
        }
        Object.entries(menuObj).forEach(([key, value]) => {
            movesArr.push(`\n ${key} : ${value}`);
        });
        movesArr.push(`\n ${0} : ${'exit'}`, `\n ${"?"} : ${"help"}`);
        return movesArr;
    }
}

class SecretKeyGenerator {
    static secretKeyGen() {
        const secretKey = crypto.randomBytes(32).toString('hex');
        return secretKey;
    }

    static turnGenerator(arr) {
        let turnIndex = Math.floor(Math.random() * (arr.length));
        let turnValue = arr.find(item => arr.indexOf(item) == turnIndex);
        return turnValue;
    }
}

class HmacGenerator {
    static hmacGenerator(turnValue, secretKey) {
        const hmac = crypto.createHmac('sha3-256', secretKey);
        hmac.update(turnValue);
        return hmac.digest('hex');
    }
}

class UserInterface {
    static userInterface(variantes, turn, sk, movesForTable) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('', (answer) => {
            let element = UserInterface.findUserTurn(variantes, answer);
            let result = ResultCalculate.resultCalculate(movesForTable, turn, element);
            let message = '';
            if (answer == 0) {
                console.log('Exit');
            } else if (answer === '?') {
                GenerateGameTable.generateGameTable(movesForTable);
            } else if (element === undefined) {
                console.log('Starting over! Enter the correct value');
            } else {
                switch (result) {
                    case (-1):
                        message = 'You lose!';
                        break;
                    case (1):
                        message = 'You win!';
                        break;
                    default:
                        message = "Draw";
                        break;
                }
                console.log(`Your move: ${element}`, `\nComputer move: ${turn}`, `\n${message}`, `\nHMAC key: ${sk}`);
            }
            rl.close();
        });
    }

    static findUserTurn(arr, answer) {
        let element;
        if (answer === 0) {
            element = 0;
        } else {
            element = arr[answer - 1];
        }
        return element;
    }
}

class GenerateGameTable {
    static generateGameTable(movesForTable) {
        const table = new Table();
        const headers = ['Your move / PC move ', ...movesForTable];
        table.push(headers);

        for (let i = 0; i < movesForTable.length; i++) {
            const row = [movesForTable[i]];
            for (let j = 0; j < movesForTable.length; j++) {
                let result = ResultCalculate.resultCalculate(movesForTable, j, i);
                if (result === 0) {
                    row.push('Draw');
                } else {
                    if (result < 0) {
                        row.push('Lose');
                    } else {
                        row.push('Win');
                    }
                }
            }
            table.push(row);
        }
        console.log(table.toString());
    }
}

class ResultCalculate {
    static resultCalculate(movesForTable, j, i) {
        let n = movesForTable.length;
        let p = (movesForTable.length - 1) / 2;
        const result = Math.sign((i - j + p + n) % n - p);
        return result;
    }
}

const gameInstance = new Game();
gameInstance.params();

// const crypto = require('crypto');
// const readline = require('readline');
// const Table = require('cli-table3');

// //сбор параметров от мяса

// function params() {
//     let variantes = process.argv.slice(2);
//     if (variantes.length >= 3 && variantes.length % 2 !== 0 ) {
//         if(isUnique(variantes)) {
//             let sk = secretKeyGen() //генерация ключа
//             let turn = turnGenerator(variantes) // создание хода ПК
//             console.log('HMAC: ' + hmacGenerator(turn, sk)) // передача HMAC
//             let x = resultMatrix(variantes) // создание матрицы вариантов
//             const movesForTable = x.slice(0, x.length-2).map(element => element.slice(6))
//             console.log('Available moves:' + x +'\n' + 'Enter your move:' ) // демонстрация матрицы и запрос хода
//             userInterface(variantes, turn, sk, movesForTable)// считывание хода и вывод наименования хода из массива
            
            
//         } else {
//             console.log("please enter unique names")
//         }
//     } else { 
//         console.log("Please enter more than 3 (an odd number of 3,5,7, etc.) choices, for example: 'Rock Paper Scissors'")
//     }
// }

// params()


// // формирование матрицы результатов
// function resultMatrix(arr) {
//     let menuObj = {};
//     let movesArr = [];
//     for (let i = 0 ; i <arr.length; i++) {
//         menuObj[i+1] = arr[i]
//     }
//     Object.entries(menuObj).forEach(([key, value]) => {
//         movesArr.push(`\n ${key} : ${value}`);
//     });
//     movesArr.push(`\n ${0} : ${'exit'}`, `\n ${"?"} : ${"help"}` )
//     return movesArr;
// }

// // проверка на уникальность названий вариантов
// function isUnique(arr) {
//     for(var i = 0; i < arr.length; i++) {
//       if (arr.indexOf(arr[i]) != i) return false;
//     }
//     return true;
//   }

//   // генератор секретного ключа
//   function secretKeyGen() {
//     const secretKey = crypto.randomBytes(32).toString('hex');
//     return secretKey;
//   }
  
//  // генератор хода компьютера

//  function turnGenerator(arr) {
//     let turnIndex = Math.floor(Math.random() * (arr.length))
//     let turnValue= arr.find(item => arr.indexOf(item) == turnIndex);
//     return turnValue
//  }

//   // генератор HMAC

//   function hmacGenerator(turnValue, secretKey) {
//     const hash = crypto.createHash('sha3-256');
//     const hmac = crypto.createHmac('sha3-256', secretKey);
//     hmac.update(turnValue);
//     return hmac.digest('hex');
//   }

//  // считывание действий пользователя
// function userInterface(variantes,turn, sk, movesForTable) {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//       });
//       rl.question('', (answer) => {
//           let element = findUserTurn(variantes,answer)
//           let result = resultCalculate(movesForTable,turn, element);
//           let message ='';
//           if (answer == 0) {
//             console.log('Exit');
//           } else if (answer === '?') {
//             generateGameTable(movesForTable)
//           } else if ( element === undefined) {
//             console.log('Starting over! Enter the correct value')
//           } else {
//             switch (result) {
//               case (-1):
//                 message = 'You lose!'
//                 break;
//               case (1):
//                 message = 'You win!'
//                 break;  
//               default: 
//                 message = "Draw"    
//                 break;         
//             } 
//             console.log(`Your move: ${element}`, `\nComputer move: ${turn}`, `\n${message}`, `\nHMAC key: ${sk}`);
//           }
//           rl.close();
          
          
//         });
// }

// function findUserTurn(arr,answer) {
//   let element;
//   if (answer === 0 ) {
//     element = 0;
//   } else {
//     element = arr[answer - 1]
//   }
  
//   return element
// }



// // отрисовка таблицы 
// function generateGameTable(movesForTable) {
//     const table = new Table();
//     const headers = ['Your move / PC move ', ...movesForTable];
//     table.push(headers);
    
//     for (let i = 0; i < movesForTable.length; i++) {
//         const row = [movesForTable[i]];
//         for (let j = 0; j < movesForTable.length; j++) {      
//             result = resultCalculate(movesForTable, j, i)      
//             if (result === 0) { 
//               row.push('Draw');
//             } else {
//               if (result < 0) {
//                 row.push('Lose');
//               } else {
//                 row.push('Win');
//               }
//             }
//           }
//           table.push(row);
//      }
//     console.log(table.toString());
//     }


//   //
//   function resultCalculate(movesForTable, j, i) {
//           let n = movesForTable.length
//           let p = (movesForTable.length- 1) /2;
//           const result = Math.sign((i - j + p + n) % n - p)
//           return result
//   }