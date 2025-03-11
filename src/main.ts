import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入Font Awesome核心
import { library } from '@fortawesome/fontawesome-svg-core'
// 导入Font Awesome组件
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 导入你需要的图标
import { 
  faUndo, faRedo, faBold, faItalic, faUnderline, faStrikethrough,
  faAlignLeft, faAlignCenter, faAlignRight, faListOl, faList,
  faTable, faImage, faFileWord, faClone, faSearch,
  faFileAlt, faCog, faMinus, faPlus, faExpand,
  faParagraph, faPlusCircle, faChevronRight, faHeading, 
  faQuoteLeft
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import './assets/styles/main.scss'

// 将导入的图标添加到库中
library.add(
  faUndo, faRedo, faBold, faItalic, faUnderline, faStrikethrough,
  faAlignLeft, faAlignCenter, faAlignRight, faListOl, faList,
  faTable, faImage, faFileWord, faClone, faSearch,
  faFileAlt, faCog, faMinus, faPlus, faExpand,
  faParagraph, faPlusCircle, faChevronRight, faHeading,
  faQuoteLeft
)

const app = createApp(App)

// 注册Element Plus
app.use(ElementPlus)

// 注册Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册Font Awesome组件
app.component('font-awesome-icon', FontAwesomeIcon)

// 注册Pinia
app.use(createPinia())

app.mount('#app')
