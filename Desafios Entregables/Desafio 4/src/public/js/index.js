console.log('Cliente conectado');

const socket = io()

const btnAdd = document.getElementById('btnAdd')
const btnDel = document.getElementById('btnDel')

btnAdd.onclick = () => {
    const title = document.getElementById('title').value
    const description = document.getElementById('description').value
    const code = document.getElementById('code').value
    const price = document.getElementById('price').value
    const stock = document.getElementById('stock').value
    const category = document.getElementById('category').value

    const object = {
        title: title,
        description: description,
        code: code,
        price: price,
        status: true,
        stock: stock,
        category: category,
        thumbnail: []
    }

    socket.emit('messageAdd', object)
}

btnDel.onclick = () => {
    const idProd = document.getElementById('idProd').value

    socket.emit('messageDel', idProd)
}

socket.on('msg_all_add', (data) => {
    console.log('Producto Agregado:')
    console.log(data)                   
})

socket.on('msg_all_del', (data) => {
    console.log('ID Eliminado:')
    console.log(data)
})