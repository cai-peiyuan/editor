const Icons = {}

Icons.loading = `
  <svg style="width: 100%; height: 100%;" width="45" height="45" viewBox="0 0 45 45" stroke="#fff">
    <g fill="none" fill-rule="evenodd" transform="translate(1 1)" stroke-width="2">
      <circle cx="22" cy="22" r="6" stroke-opacity="0">
        <animate attributeName="r"
              begin="1.5s" dur="3s"
              values="6;22"
              calcMode="linear"
              repeatCount="indefinite" />
        <animate attributeName="stroke-opacity"
              begin="1.5s" dur="3s"
              values="1;0" calcMode="linear"
              repeatCount="indefinite" />
        <animate attributeName="stroke-width"
              begin="1.5s" dur="3s"
              values="2;0" calcMode="linear"
              repeatCount="indefinite" />
      </circle>
      <circle cx="22" cy="22" r="6" stroke-opacity="0">
        <animate attributeName="r"
              begin="3s" dur="3s"
              values="6;22"
              calcMode="linear"
              repeatCount="indefinite" />
        <animate attributeName="stroke-opacity"
              begin="3s" dur="3s"
              values="1;0" calcMode="linear"
              repeatCount="indefinite" />
        <animate attributeName="stroke-width"
              begin="3s" dur="3s"
              values="2;0" calcMode="linear"
              repeatCount="indefinite" />
      </circle>
      <circle cx="22" cy="22" r="8">
        <animate attributeName="r"
              begin="0s" dur="1.5s"
              values="6;1;2;3;4;5;6"
              calcMode="linear"
              repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
  `


Icons.download = `
  <svg height="19px" viewBox="0 0 14 19" width="14px" xmlns="http://www.w3.org/2000/svg">
    <title/><desc/><defs/>
    <g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1">
      <g fill="#ffffff" id="Core" transform="translate(-383.000000, -213.000000)">
        <g id="file-download" transform="translate(383.000000, 213.500000)">
          <path d="M14,6 L10,6 L10,0 L4,0 L4,6 L0,6 L7,13 L14,6 L14,6 Z M0,15 L0,17 L14,17 L14,15 L0,15 L0,15 Z" id="Shape"/>
        </g>
      </g>
    </g>
  </svg>
  `
  Icons.resetIcon=`
  <svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="16px" height="16px">
<image  x="0px" y="0px" width="16px" height="16px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBg4ACisPD6AWAAABPklEQVQoz2XRMUjUARzF8fe/K5QCQYIoEJyKw+CEJoWCaHCJguCWhiBaInBQaGhokxoEG8SlLIdoCKylomyoRQTToZYIChGdirJFvC6QPg5x3km/t/x4fPnx473Irl6YU9VlX5uX1nrGIu5757dZ/XuBwoQtYyoKZSdNaRhpB8atON5+2KAN15rAgLqKiHMmTTgl4qy6nn/ArHFRmPHDpAe23BLxzF2XomRTVVzwXY+IqrqquIiPsd9DZTHt9u4HT9wU3V45UsqhFPmbpCONNKeeziTb+ZBv8QbHxBVfHBRx1C+nxZCvUsrnLKSW5HHWs5Th3Mj7PM98klreJhHnbTgsOoya89JVhTihoa8Z1FOLuvcE1WvFnVaSB7y25rJOEV2G/TSt3F5WyXWr/hjzyLZPav+3GYWKXkOW3Wu5O0ReKaTFHHxGAAAAAElFTkSuQmCC" />
</svg>
  `
  Icons.recoveryIcon = `
  <svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="14px" height="13px">
<image  x="0px" y="0px" width="14px" height="13px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAQAAAAz1Zf0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBg4ACwMjoTmtAAAAo0lEQVQY03WMsQ7BUABFz5NHutr8AYPForvFbDaLHyDxDV0NXQwWsw/oICEWPoGYpJE0CJOQuoYOmqpzx5N7EEJGHRVFdonyFamcJ418HVX9VcJoiMeOkC9v9kzYgGXBnSvTlLQ0WTFgjJCrm0aZZEsPNYwAXObUuZBmxhn9W19BgX+UiJNsHgHr/KQjT5Eqlh7dzMehRkibk2XJKyOfHNgSwwebgnnGMi9j9wAAAABJRU5ErkJggg==" />
</svg>
  `
  Icons.releaseIcon = `
  <svg 
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="15px" height="16px">
 <image  x="0px" y="0px" width="15px" height="16px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAQAAABjX+2PAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBg4ACxswzaH7AAAAsElEQVQY073OoU4DYRBF4W9LQ8gv2JWkghSDQMErrIDH4okqKsEh6wgCLH4FrQBCmvYiIOmmaZHcUXNPMmeq6OUAq34xdK6Ye0XtDjcWGGt8eZF1kkmkzixJMksdmSRJRlXiyqPaveJJ49SHawuNN2eDX8lU0ep0WsV04/7JrWcd6LQutvFD791usw38mX/Ea8stnuQydkyTZDzEyHzH3WOo8uloj3jlpEpxuAcvvX8DaZ5Mk8000KAAAAAASUVORK5CYII=" />
 </svg>
  `
  Icons.downloadIcon = `
  <svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="14px" height="14px">
<image  x="0px" y="0px" width="14px" height="14px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBg4AChcgYNyRAAAAnklEQVQY02P8z4AEUhi+MSxDcJmQ5RhsGMyQuaiSaIByyUaGCiiLkWEqQzKEycIQzXCe4RrDQYYtUKlpDCEMMxgYGCwYRBn+X/if8J/hP8N/p//f/r/+//H/6/+6/xn+M/xv+L8BYec+Bh8GboZfDE4Ml2FCLEj272NwYPjEcAMhwILivFMkeIXx/wUGIYZ3WGQkGE4w/rdiUMOh8TwAZosr12qtxbsAAAAASUVORK5CYII=" />
</svg>
  `

  // Icons.resetIcon = `
  //   <svg 
  //  xmlns="http://www.w3.org/2000/svg"
  //  xmlns:xlink="http://www.w3.org/1999/xlink"
  //  width="16px" height="16px">
  // <image  x="0px" y="0px" width="16px" height="16px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBgcXNiX/JQ6RAAABYklEQVQoz1XR32fVcRzH8cf3O9lIUemir9hNNitOnPdN000iJ2UppotYdHXIuegi6ypdFY30D6QfRNRUVomyI/2gxacm/byYkrEW6WKcoqN1cers7H35er29vN/PV6Y9cccKoz5rpOaSmrftHdarqLltIW7E1mULkcU59zw0oGqX7eZNxTEd4WMxE306lcH4HlXIiG3qyukDsVfFb7fSU2Knu/rSbBfFeQ/StciKi054Y5WzRT73eO5TUba5WCvyWIgSsS/mYyNEKRpRIg7EYkznulz3FkMupFlIr03Yg0fu251bJ/MH3X61b2zoQdOr9DV3xRGbUDcSKyE22G8Sgw6Se++ZYVz1xYuoxXFTJtITDJtsvTnksoH0LbodVdF006W0GFsk5fSuhWU8nseaZaB6YybOLHVx2A/TMRI9EKujJqk7+Y8kRK5qVGFMr0M+OpXGW07WEZvp91O/016m6n/1L/4uan5gfUlhAAAAAElFTkSuQmCC" />
  // </svg>
  // `
  // Icons.recoveryIcon = `
  //   <svg 
  //  xmlns="http://www.w3.org/2000/svg"
  //  xmlns:xlink="http://www.w3.org/1999/xlink"
  //  width="14px" height="13px">
  // <image  x="0px" y="0px" width="14px" height="13px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAQAAAAz1Zf0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBgcXNwnU5lMzAAAAl0lEQVQY03XMIW7CYAAF4K/kH8GC2g3AYsBjpqfRyy4ACWeoBIFBYDhFBQkLZjvClqmlIalYNkUgJQhMU9qnXt6XPCDy7EFlIkuZdh396FbTVOxTWtguvqy8E2z9+7UuYDDwZmIBQ39mpceRo/6tDqU6Jd6Yq82rpFGLTXlUi4l9NbTEMo/Bi/Ed9aSeHIKdcwlPvn3IuQI6QSHw3bUiPwAAAABJRU5ErkJggg==" />
  // </svg>
  // `
  // Icons.releaseIcon = `
  // <svg 
  //  xmlns="http://www.w3.org/2000/svg"
  //  xmlns:xlink="http://www.w3.org/1999/xlink"
  //  width="15px" height="16px">
  // <image  x="0px" y="0px" width="15px" height="16px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAQAAABjX+2PAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBgcXNyXmPj/QAAAAtUlEQVQY072RvQ4BYRBFDzYiW7ibaEQhNAqdV9iC9/ECnmgLJZ1SJwpa/VcwBSJiP4X1s4LSbSY3JzP3JgMvUkklciqoQ8jONiAxAQZmoBYRJ1ujVF4JSJrLy2sugRJ5eTUK8vRsITElZElEkwN9M0VsaRezkDEhMQ5HTMj4nh1kc8TKnABzium+YZs925rj4Yr81B9xyjmPg1djw/ftAGho9+Fu9faSI5UvwRfqATXKX/DZ9lcd1jOtL4ynOwAAAABJRU5ErkJggg==" />
  // </svg>
  // `
  
  // Icons.downloadIcon = `
  // <svg 
  //  xmlns="http://www.w3.org/2000/svg"
  //  xmlns:xlink="http://www.w3.org/1999/xlink"
  //  width="14px" height="14px">
  // <image  x="0px" y="0px" width="14px" height="14px"  xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfoBgcXNh3XJ7YPAAAAmElEQVQY06XPsQpBARjF8d/FZpPBE8hisEgyyCybyaJ4CCOLNzB4C09gloWyeAa3FIOilIG694pBvumc79/X+U5afIZKdpFNJWBDNW6T8G3+hxOjlwrMDJ4yreculDJ3l3fV0TV1UFNhqw9aLkInoTIYW0SZS21ZN62oaSaWv9R0to8WmcR76x+qBLZyjh9IwSpQV/xyuHkAAcYcZ94ONTUAAAAASUVORK5CYII=" />
  // </svg>
  // `
  

export default Icons
