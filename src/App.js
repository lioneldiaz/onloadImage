import React, { Component } from 'react'
import Modal from 'react-modal'
import photo from './image.jpg'
import FaTimesCircle from 'react-icons/lib/fa/times-circle'
import './App.css'

/**
 * @description Read file
 */
const readFileAsDataURL = (file) =>
  new Promise(resolve => {
    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target.result)
    }

    reader.readAsDataURL(file)
  })
/**
 * @description Resize a image
 * @param {string} imageURL 
 * @param {HTMLElement} canvas 
 * @param {number} max_size 
 */
const resizeImage = (imageURL, canvas, max_size) =>
  new Promise(resolve => {
    const image = new Image()

    image.onload = () => {
      const context = canvas.getContext('2d')

      let width = image.width
      let height = image.height

      if (width > height && width > max_size) {
        height *= max_size / width
        width = max_size     
      } else if (height > max_size) {
        width *= max_size / height
        height = max_size
      }

      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)

      resolve(canvas.toDataURL('image/jpeg'))
    }

    image.src = imageURL
  })

class App extends Component {
  /**
   * @description Represent App
   */
  constructor() {
    super()
    this.state = {
      url: photo,
      angle: 180,
      show: false,
      save: false
    }
  }
  showWindow = () => this.setState(() => ({show: true}))
  closeWindow = () => {
    this.setState(() => ({show: false}))
    
  } 
  /**
   * @description Region to capture a part of the image
   */
  drawRegion = () => {
    let mousePosition
    let offset = [0,0]
    let isDown = false
    let div = document.createElement('div')
    div.setAttribute('id','mark')
    div.style.position = 'absolute'
    div.style.left = '0px'
    div.style.top = '0px'
    div.style.width = '100px'
    div.style.height = '100px'
    div.style.border ='1px solid red'
    document.getElementById('box').appendChild(div)

    div.addEventListener('mousedown', function(e) {
      isDown=true
      offset = [
        div.offsetLeft - e.clientX,
        div.offsetTop - e.clientY
      ]
    }, true)
    document.addEventListener('mouseup', function() {
      isDown = false
    }, true)
  
    document.addEventListener('mousemove', function(event) {
        event.preventDefault()
        if (isDown) {
            mousePosition = {  
                x : event.clientX,
                y : event.clientY  
            }
            div.style.left = (mousePosition.x + offset[0]) + 'px'
            div.style.top  = (mousePosition.y + offset[1]) + 'px'
          }        
    }, true)
  }
  
  afterOpenModal = () => {
    this.canva.setAttribute('id','oldCanvas')
    document.getElementById('box').appendChild(this.canva)
    this.drawRegion()
  }
  /**
   * @description Rotate image 180 degree
   */
  rotate = () => {
    const ctx = this.canva.getContext('2d')
    ctx.clearRect(0, 0, this.canva.width, this.canva.height)
    
    ctx.translate(this.canva.width/2,this.canva.height/2)
    ctx.rotate(this.state.angle * Math.PI/180)
    ctx.translate(-this.canva.width/2,-this.canva.height/2)
    ctx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, this.canva.width, this.canva.height)
  }
  getImage = () => {    
    /**
     * @description Take the coordinates of the image
     */
    const v = document.getElementById('mark')
    let sx = parseInt(v.style.left.slice(0,-2))
    let sy = parseInt(v.style.top.slice(0,-2)) - 35
    console.log("SX ", sx)
    console.log("SY ", sy)
    /**
     * @description To caught the image in the canava
     */
    const ctx = this.canva.getContext('2d')
    const imgData = ctx.getImageData(sx,sy,100,100)        
    /**
     * @description Create a new canva to insert in the child
     */
    this.newCanva = document.createElement('canvas')
    this.newCanva.setAttribute('id','newImage')
    const context = this.newCanva.getContext('2d')
    context.putImageData(imgData, 0, 0)
    this.setState(() => ({save: true})) 
    this.closeWindow()
  }
  /**
   *@description Invoke immediately after updating occurs 
   */
  componentDidUpdate () {
    if (!this.state.show && this.state.save) {
      const child = document.getElementById('new')
      /**
       * @description Remove the node inside of the element child if it exist
       */
      if (child.lastChild !== null)
        child.removeChild(document.getElementById('newImage'))
      child.appendChild(this.newCanva)

      this.setState({save: false})
    }    
  }  
  /**
   * @description Invoke immediately after the component is inserted in the DOM.
   */
  componentDidMount () {    
    this.canva = document.createElement('canvas')
  }
  /**
   * @description Handle any change in the input
   */
  handleFileChange = (event) => {
    const file = event.target.files[0]

    if (file && file.type.match(/^image\//)) {
      readFileAsDataURL(file).then(originalURL => {
        resizeImage(originalURL, this.canva, 400).then(url => {
          this.setState({ 
            url,
            show: true
          })
        })
      })
    } else {
      this.setState({ url: '' })
    }
  }
  render() {
    if (this.state.show) {
      return (
        <Modal
          isOpen={this.state.show}
          onRequestClose={this.closeWindow}
          onAfterOpen={this.afterOpenModal}
          className="Modal"
          ariaHideApp={false}
        >
          <div className="modal-title">
            <div style={{float:'left', color:'rgb(204, 204, 204)'}}>Crop your picture</div>
            <button className="icon-btn" style={{float:'right'}} onClick={this.closeWindow}>
              <FaTimesCircle size={30} style={{color:'gray'}}/>
            </button>
          </div>
          <div id="box"/>        
            <div style={{marginLeft:100}}>
              <button onClick={this.getImage}>Save</button>
              <button onClick={this.rotate}>Rotate</button>
          </div>
        </Modal>
      )
    }
    return (
      <div>
        <input
          type="file"
          onChange={this.handleFileChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
        <div id="new" style={{marginLeft:100, marginTop:10}}></div>       
      </div>
    )
  }
}
export default App
