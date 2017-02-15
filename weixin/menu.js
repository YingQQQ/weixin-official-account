'use strict'
module.exports = {
	"button":[{
		"name":"点击事件",
        "type":"click",
        "key":"menu_click"
	},{
		"name":"点击菜单",
		"sub_button":[{
			"type":"view",
            "name":"搜索",
            "url":"http://www.baidu.com"
		},{
			"type":"scancode_push",
            "name":"扫码推送事件",
            "key":"qr_scan"
		},{
			"type":"scancode_waitmsg",
            "name":"扫码事件提示框",
            "key":"qr_scan_wait"
		},{
			"type":"pic_sysphoto",
            "name":"弹出拍照发图",
            "key":"pic_photo"
		},{
			"type":"pic_photo_or_album",
            "name":"拍照相册发图",
            "key":"pic_photo_album"
		}]
	},{
		"name":"点击菜单2",
		"sub_button":[{
			"type":"pic_weixin",
	        "name":"弹出相册发图器",
	        "key":"pic_weixin"
		},{
			"type":"location_select",
	        "name":"弹出地理位置",
	        "key":"location_select"
		}]
	}]
}


// module.exports = {
// 	"button":[
//      {
//           "name":"点击事件",
//           "type":"click",
//           "key":"menu_click"
//       },{
//            "name":"点击菜单",
//            "sub_button":[
//            {
//                "type":"view",
//                "name":"搜索",
//                "url":"http://www.baidu.com/"
//             },
//             {
//                "type":"scancode_push",
//                "name":"扫码推送事件",
//                "key":"qr_scan"
//             },
//             {
//                "type":"scancode_waitmsg",
//                "name":"扫码推事件且弹出“消息接收中”提示框",
//                "key":"qr_scan_wait"
//             },
//             {
//                "type":"pic_sysphoto",
//                "name":"弹出系统拍照发图",
//                "key":"pic_photo"
//             },
//             {
//                "type":"pic_photo_or_album",
//                "name":"弹出拍照或者相册发图",
//                "key":"pic_photo_album"
//             }]
//       },{
// 	      	"name":"点击菜单2",
// 	      	"sub_button":[{
// 	      	  "type":"pic_weixin",
// 	          "name":"弹出微信相册发图器",
// 	          "key":"pic_weixin"
//       	},{
//       		  "type":"location_select",
// 	          "name":"弹出地理位置选择器",
// 	          "key":"location_select"
//       	}/*{
//       		  "type":"media_id",
// 	          "name":"下发消息（除文本消息）",
// 	          "media_id":"media_id"
//       	},{
//       		  "type":"view_limited",
// 	          "name":"跳转图文消息URL",
// 	          "media_id":"media_id"
//       	}*/]
//       }
//     ]
// }