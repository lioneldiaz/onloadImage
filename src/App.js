import React, { Component } from 'react'
import Modal from 'react-modal'
import photo from './image.jpg'
import FaTimesCircle from 'react-icons/lib/fa/times-circle'
import './App.css'

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
   * @description Draw a image in the canva
   */
  draw = () => {
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('id','oldCanvas')
    document.getElementById('box').appendChild(this.canvas)
    const ctx = this.canvas.getContext("2d")
    this.img = new Image()
    this.img.src = this.state.url
    let max_size = 400
    this.img.onload = () => {
      let width = this.img.width
      let height = this.img.height

      if (width > height && width > max_size) {
        height *= max_size / width
        width = max_size     
      } else if (height > max_size) {
        width *= max_size / height
        height = max_size
      }

      this.canvas.width = width
      this.canvas.height = height     
      ctx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, width, height)   
    }
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
    this.draw()
    this.drawRegion()
  }
  /**
   * @description Rotate image 180 degree
   */
  rotate = () => {
    const ctx = this.canvas.getContext('2d')    
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    ctx.translate(this.canvas.width/2,this.canvas.height/2)
    ctx.rotate(this.state.angle * Math.PI/180)
    ctx.translate(-this.canvas.width/2,-this.canvas.height/2)
    
    ctx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, this.canvas.width, this.canvas.height)
  }
  getImage = () => {    
    /**
     * @description Take the coordinates of the image
     */
    const v = document.getElementById('mark')
    let sx = parseInt(v.style.left.slice(0,-2))
    let sy = parseInt(v.style.top.slice(0,-2))
    /**
     * @description To caught the image in the canava
     */
    const ctx = this.canvas.getContext('2d')
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
  render() {
    if (this.state.show) {
      return (
        <Modal
          isOpen={this.state.show}
          onRequestClose={this.closeWindow}
          onAfterOpen={this.afterOpenModal}
          style={{
            top: '50%',
            left: '50%',
            right: '50%',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)'
          }}
          ariaHideApp={false}
        >
          <div>
            <div style={{float:'left'}}>Crop your picture</div>
            <button className='icon-btn' style={{float:'right'}} onClick={this.closeWindow}>
              <FaTimesCircle size={30}/>
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
        <button onClick={this.showWindow}>Show</button>        
        <div id="new" style={{marginLeft:100, marginTop:10}}></div>       
      </div>
    )
  }
}
export default App
