import React from 'react'
import PropTypes from 'prop-types'
import ScrollContainer from './ScrollContainer'
import LayerListGroupList from "./LayerListGroupList";

type AppLayoutProps = {
  toolbar: React.ReactElement
  layerList: React.ReactElement
  layerEditor?: React.ReactElement
  LayerListGroupList: React.ReactElement
  layerEditorMini?: React.ReactElement
  map: React.ReactElement
  bottom?: React.ReactElement
  modals?: React.ReactNode
};

class AppLayout extends React.Component<AppLayoutProps> {
  static childContextTypes = {
    reactIconBase: PropTypes.object
  }

  getChildContext() {
    return {
      reactIconBase: { size: 16 }
    }
  }

  render() {
    return <div className="maputnik-layout">
      {this.props.toolbar}

      {/*图层列表*/}
      <div className="maputnik-layout-list"
           style={runConfig.mainLayout.toolBar.show === false? {top:"0px",height:"calc(100% - 0px)"}: {}}
      >
        {this.props.layerList}
      </div>

      {/*图层详细配置*/}
      <div className="maputnik-layout-drawer"
           style={runConfig.mainLayout.toolBar.show === false? {top:"0px",height:"calc(100% - 0px)"}: {}}
      >
        <ScrollContainer>
          {this.props.layerEditor}
        </ScrollContainer>
      </div>


      <div className="maputnik-layout-list-mini"
           style={runConfig.mainLayout.toolBar.show === false? {top:"0px",height:"calc(100% - 0px)"}: {}}
      >
        {this.props.LayerListGroupList}
      </div>



      <div className="maputnik-layout-drawer-mini"
           style={
        runConfig.mainLayout.toolBar.show === false? {top:"0px",height:"calc(100% - 0px)"}: {}
      }
      >
        <ScrollContainer>
          {this.props.layerEditorMini}
        </ScrollContainer>
      </div>


      {this.props.map}
      {this.props.bottom && <div className="maputnik-layout-bottom">
        {this.props.bottom}
      </div>
      }
      {this.props.modals}
    </div>
  }
}

export default AppLayout
