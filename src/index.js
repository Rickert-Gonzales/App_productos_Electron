// app es la aplicacion en si y brouserwindow es la ventana que usaremos
//para crear nuestra propia navegacion o nuestro propio navegador, usaremos
//la libreria de Menu
//importamos ipcMain para la recepcion de datos en la ventana principal
const { app, BrowserWindow, Menu, ipcMain } = require('electron') //llamamos a la libreria de electron

const url = require('url')
const path = require('path')

//creamos un if para ver en que tipo de proceso estamos
//esto nos servia para hacer un reloader de la app
if(process.env.NODE_ENV !== 'production'){
    require('electron-reload')(__dirname, {
        //con esto le decimos que reinic cuando camiamos algo del codigo principal
        electron: path.join(__dirname, '..node_modules', '.bin', 'electron')
    })
}

//definimos una variable para poder dar dimeniciones a la ventana
let mainWindow
//definimos una variable para la nueva ventana
let newProductWidow

//llamamos al meetodo de redy para iniciar
app.on('ready', () => {
    //asignamos a la variable en brouserwindow donde definiremos las dimenciones
    mainWindow = new BrowserWindow({
        webPreferences:{nodeIntegration: true}
    })
    //le pasamos un archivo
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true,
    }))
    //llamamos al menu para personalzarlo mediante un arreglo
    //dentro de los parentesis ponemos el arreglo del menu
    //y almacenamos todo este codigo en una constate para depues integrarlo
    const mainMenu = Menu.buildFromTemplate(templateMenu)

    //integramos el menu "mainMenu"
    //llamamos a la libreria Menu y mediante
    //setApplicationMenu integramos la constante creada "mainMenu"
    Menu.setApplicationMenu(mainMenu)

    //est codigo nos servira para escuchar los eventos de la ventana
    //ahora implemnetaremos el de cierre
    mainWindow.on('closed', () =>{
        //esto ara que se cierren todas las ventanas, al cerrar la ventana principal
        app.quit()
    })
})

//creamos una funcion para llamar a otra ventana
function createNewProductWindow() {
    //llamamos a la libreria de la ventana
    newProductWidow = new BrowserWindow({
        //le damos dimenciones
        width: 400,
        height: 350,
        title: 'Nuevo Producto',
        webPreferences:{nodeIntegration: true}
    })
    //dentro de la segunda ventana no queremos mostrar un menu
    //para ello usamos setMenu(null)
    //newProductWidow.setMenu(null)

    //le pasamos un archivo
    newProductWidow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }))
}

//mandamos informacion a la ventana principal
ipcMain.on('product:new', (e, newProduct) => {
    //enviamos el evento a la ventana "mainwindow" mediante webContents
    //con esto el html ya puede escuchar el evento
    mainWindow.webContents.send('product:new', newProduct)
    //console.log(newProduct)
    
    //para cerrar la ventana despues de mandar datos usaremos
    newProductWidow.close()
})

//creamos el arreglo para el menu, en base a objetos
const templateMenu = [
    {//definimos primera pestaña del primer menu
        label: 'File',
        //definimos submenu
        submenu: [
            {//opciones del submenu
                label: 'New Product',
                //atajo de teckado
                accelerator: 'Ctrl+N',
                //evento click
                click(){
                    //llamamos a la nueva ventana
                    createNewProductWindow()
                }
            },
            {//definimos otra pestaña del primer menu
                label: 'Remove All Product',
                click(){
                    //con esto limpiamos todo la ventana
                    //este metodo tine que ser llamado desde el index.html
                    mainWindow.webContents.send('products:remove-all')
                }
            },
            {//definimos otra pestaña del primer menu
                label: 'Exit',
                //en este caso usaremos un validador de sistema operativo para nuestro shorcat
                //usaremos process.pltafor que nos devulebe el sistema donde de ejecuta nuestro programa
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    },

]

//validamos la plataforma donde se ejecuta nuestra app
if(process.platform == 'darwin'){
    templateMenu.unshift({
        label: app.getName()
    })
}

//definimos nuestra herramienta de desarrollo
if(process.env.NODE_ENV !== 'production'){
    templateMenu.push({
        label: 'DevTools',
        submenu:[
            {
                label: 'Show/Hide Dev Tools',
                accelerator: 'Ctrl+D',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label: 'Reload',
                role: 'reloader'
            }
        ]
    })
}  