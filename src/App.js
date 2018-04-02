import React, { Component } from 'react'
import ImageInput from './components/ImageInput'
class App extends Component {
  render() {    
    return (
      <form>
        <ImageInput 
          className = "avatar-input"
          name = "avatarURL"
          sizeInput = {60}
        />  
      </form>    
    )
  }
}
export default App
