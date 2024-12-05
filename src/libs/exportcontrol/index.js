import 'canvas-toBlob'
import FileSaver from 'file-saver'
import icons from './icons'

class ExportControl {

	map = null

	constructor(options = {}) {
		this.options = Object.assign({
			dpi: 300,
			attribution: "© MapAbc",
			textFont: [],
			callBackFunc: (imageData) => {
				console.log("default download shot snap call back " + imageData)
			},
			downloadStyle:()=>{
				
			},
			callRecovery:()=>{
				
			},
			resetStyle:()=>{
				
			}
		}, options)
	}

	downloadMap(download, callback) {
		console.log('---downloadMap-----,下载地图')
		const actualPixelRatio = window.devicePixelRatio;
		Object.defineProperty(window, 'devicePixelRatio', {
			get: () => this.options.dpi / 96
		});

		const _loading = this.loading()

		const _container = document.createElement('div')
		document.body.appendChild(_container)

		const width = this.map.getContainer().offsetWidth
		const height = this.map.getContainer().offsetHeight
		const bottomRight = this.map.unproject([width, height]).toArray()

		this.setStyles(_container, {
			visibility: "hidden",
			position: "absolute",
			top: 0,
			bottom: 0,
			width: `${width}px`,
			height: `${height}px`,
		})

		let fontFamily = []
		if(this.map.style.glyphManager && this.map.style.glyphManager.localIdeographFontFamily) {
			fontFamily = this.map.style.glyphManager.localIdeographFontFamily
		}

		let mbgl;
		if('undefined' !== typeof window.geolonia) {
			/* eslint no-undef: "error" */
			mbgl = window.geolonia.Map
		} else {
			mbgl = mapboxgl.Map
		}

		const _map = new mbgl({
			container: _container,
			center: this.map.getCenter(),
			zoom: this.map.getZoom(),
			bearing: this.map.getBearing(),
			pitch: this.map.getPitch(),
			style: this.map.getStyle(),
			localIdeographFontFamily: fontFamily,
			hash: false,
			preserveDrawingBuffer: true,
			interactive: false,
			attributionControl: false,
		})

		_map.once('load', () => {
			const geojson = {
				type: 'FeatureCollection',
				features: [{
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: bottomRight
					},
					properties: {
						text: this.options.attribution
					}
				}]
			};

			_map.addSource("attribution-for-image", {
				type: "geojson",
				data: geojson
			})

			let textFont = []
			if(this.options.textFont.length) {
				textFont = this.options.textFont
			} else {
				const layers = this.map.getStyle().layers
				for(let i = 0; i < layers.length; i++) {
					try {
						const fonts = this.map.getLayoutProperty(layers[i].id, 'text-font')
						if(fonts && fonts.length) {
							textFont = fonts
							break;
						}
					} catch(e) {
						// Nothing to do.
					}
				}
			}

			_map.addLayer({
				"id": "markers",
				"type": "symbol",
				"source": "attribution-for-image",
				"paint": {
					"text-color": "#000000",
					"text-halo-color": "rgba(255, 255, 255, 1)",
					"text-halo-width": 2,
				},
				"layout": {
					"text-field": "{text}",
					"text-font": textFont,
					"text-size": 20,
					"text-anchor": "bottom-right",
					"text-max-width": 50,
					"text-offset": [-0.5, -0.5],
					"text-allow-overlap": true,
				}
			});

			setTimeout(() => {
				_map.getCanvas().toBlob((blob) => {
					if(download == undefined || download == true) {
						FileSaver.saveAs(blob, `${_map.getCenter().toArray().join('-')}.png`)
					}
					if(callback) {
						callback(blob)
					}
					this.options.callBackFunc(blob)
					_map.remove()
					_container.parentNode.removeChild(_container)
					_loading.parentNode.removeChild(_loading)
					Object.defineProperty(window, 'devicePixelRatio', {
						get: () => actualPixelRatio
					});
				})
			}, 3000)
		})
	}

	onAdd(map) {
		this.map = map;
		this.container = document.createElement('div')
		this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
		var btnsList = ['下载当前视野地图', '初始化样式', '恢复至已发布样式', '发布样式', '下载样式']
		btnsList.forEach((item) => {
			const btn = document.createElement('button')
			btn.className = 'maplibregl-ctrl-icon mapbox-gl-download'
			btn.type = "button"
			btn.title = item
			btn.setAttribute("aria-label", item)
			if(item == "下载当前视野地图"){
				btn.innerHTML = icons.download
			}
			if(item == "初始化样式"){
				btn.innerHTML = icons.resetIcon
			}
			if(item == "恢复至已发布样式"){
				btn.innerHTML = icons.recoveryIcon
			}if(item == "发布样式"){
				btn.innerHTML = icons.releaseIcon
			}if(item == "下载样式"){
				btn.innerHTML = icons.downloadIcon
			}
			
			this.container.appendChild(btn)
			btn.addEventListener('click', () => {
				if(item == "下载当前视野地图"){
					this.downloadMap()
				}
				if(item == "初始化样式"){
					this.options.resetStyle();
				}
				if(item == "恢复至已发布样式"){
					this.options.callRecovery();
				}if(item == "发布样式"){
					this.options.publishStyle();
				}if(item == "下载样式"){
					this.options.downloadStyle();
				}
				
			})
		})
		return this.container
	}
	getAddBtn(map) {

	}
	onRemove() {
		this.container.parentNode.removeChild(this.container)
	}

	loading() {
		const container = document.createElement('div')
		document.body.appendChild(container)

		this.setStyles(container, {
			position: "absolute",
			top: 0,
			bottom: 0,
			width: "100%",
			backgroundColor: "rgba(0, 0, 0, 0.6)",
			zIndex: 9999,
		})

		const icon = document.createElement('div')
		icon.innerHTML = icons.loading

		this.setStyles(icon, {
			position: "absolute",
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: 9999,
			margin: "auto",
			width: "120px",
			height: "120px",
		})

		container.appendChild(icon)

		return container;
	}

	setStyles(element, styles) {
		for(const style in styles) {
			element.style[style] = styles[style]
		}
	}
}

export default ExportControl