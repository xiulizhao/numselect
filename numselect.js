(function (root, factory) {
  /* CommonJS */
  if (typeof exports == "object") module.exports = factory();
  /* AMD module */
  else if (typeof define == "function" && define.amd) define(factory);

  /*第一处修改，将wwtemplate改为元素名(data-wwclass的值)*/
  else root.numselect = factory();
}(this, function () {
  "use strict";

  /*第二处修改，将wwtemplate改为元素名(data-wwclass的值)*/
  var wwclassName = /*INSBEGIN:WWCLSNAME*/
    "numselect"
    /*INSEND:WWCLSNAME*/
    ;

  //默认没有依赖资源
  function loadDependence(fncallback) {
    if (typeof fncallback === "function") {
      fncallback();
    }
  }

  // 本函数处理元素初始化动作
  var init = function () {
    init = function () {
      return true;
    };

    $.wwclass.addEvtinHandler(wwclassName, evtInHandler);

    // 如有其他初始化动作, 请继续在下方添加
  };

  // 元素初始化——每个wwclass元素只会被初始化一次。, 传入了元素对象($前缀表明是一个jquery对象).
  function processElement($ele) {

    if ($ele.data("wwcls_inited") === 1) {
      return
    }
    $ele.data("wwcls_inited", 1)
    // 对 $ele 元素做对应处理
    var num = $.wwclass.helper.getJSONprop($ele, "data--num");
    $.wwclass.helper.updateProp($ele, "data-x-contentnum", num);
    var min = $.wwclass.helper.getJSONprop($ele, "data-min");

    var setp = Number($.wwclass.helper.getJSONprop($ele, "data-step")) || 1;
    min = (min === false) ? -Infinity : min;
    var max = $.wwclass.helper.getJSONprop($ele, "data-max") || Infinity;

    max = (max === false) ? Infinity : max;
    if (max < min) {
      console.error("检测到数量上限小于下限, 自动将上限修正为无穷大");
      max = Infinity;
    }

    $ele.attr("data-min", min);
    $ele.attr("data-max", max);

    if (num === false) {
      $ele.attr("data--num", min == -Infinity ? 0 : min);
      boundaryNum($ele, num);
    } else {
      setNum($ele, num);
    }

    // 禁用处理
    if ($ele.attr("data--disabled")) {
      $ele.find("button, input").attr("disabled", "disabled");
    }

    // 事件处理
    $ele.find("input").on("change", function (e) {
      var $this = $(e.currentTarget);

      var $ele = $this.parents('[data-wwclass="numselect"]').first();

      var val = checkNum($ele, $this.val());

      if (val !== false) {
        setNum($ele, val);
      } else {
        $this.val($ele.data("value"));
      }
    });

    $ele.find(".minus").on("click", function (e) {   //.off('click')
      var $this = $(e.currentTarget);
      var $ele = $this.parents('[data-wwclass="numselect"]').first();
      if ($this.attr("disabled")) {
        return;
      }

      setNum($ele, $ele.data("value") - setp);

      var valueNum = $ele.data("value");
      $.wwclass.helper.updateProp($ele, "data-x-contentnum", valueNum);
      $.wwclass.helper.anijsTrigger($ele, "onMinus");
    });

    $ele.find(".plus").on("click", function (e) {
      var $this = $(e.currentTarget);
      var $ele = $this.parents('[data-wwclass="numselect"]').first();
      if ($this.attr("disabled")) {
        return;
      }
      // setNum($ele, $ele.find("input").first().val() /*$ele.data("value")*/ + setp);
      setNum($ele, $ele.data("value") + setp);

      var valueNum = $ele.data("value");
      $.wwclass.helper.updateProp($ele, "data-x-contentnum", valueNum);
      $.wwclass.helper.anijsTrigger($ele, "onPlus");

    });
  };

  // 元素析构——每个wwclass元素只会被析构一次。, 传入了元素对象($前缀表明是一个jquery对象).
  function finalizeElement($ele) {
    // 对 $ele 元素做对应处理
  };

  function checkNum($ele, value) {
    var regx = /^-?\d+\.?\d*$/i;
    var min = $.wwclass.helper.getJSONprop($ele, "data-min");
    min = (min === false) ? -Infinity : min;
    var max = $.wwclass.helper.getJSONprop($ele, "data-max");
    max = (max === false) ? Infinity : max;
    if (typeof value == "string") {
      if (!regx.test(value)) {
        return false;
      }
      value = parseInt(value);
      // console.log(value);
    }
    if (value >= min && value <= max) {
      return value;
    } else {
      return false;
    }
  }

  function setNum($ele, num) {

    $ele.attr("data--num", num);
    $ele.find("input").first().val(num);
    $ele.data("value", num);
    //debugger;
    boundaryNum($ele, num);
  }

  function boundaryNum($ele, num) {
    var min = $.wwclass.helper.getJSONprop($ele, "data-min");
    min = min === false ? -Infinity : min;
    var max = $.wwclass.helper.getJSONprop($ele, "data-max");
    max = max === false ? Infinity : max;
    var setp = Number($.wwclass.helper.getJSONprop($ele, "data-step")) || 1;
    if (num == min || num - setp < min) {
      $ele.find(".minus").attr("disabled", "disabled");
    } else {
      $ele.find(".minus").removeAttr("disabled");
    }
    if (num == max || num + setp > max || num + setp < min) {
      $ele.find(".plus").attr("disabled", "disabled");
    } else {
      $ele.find(".plus").removeAttr("disabled");
    }
  }

  // 监听属性相关处理
  var evtInHandler = function ($ele, attribute, value) {
    // 处理代码
    switch (attribute) {
      case "data--num":
        // 添加处理动作
        var num = checkNum($ele, value);

        if (num !== false) {
          setNum($ele, num);
        } else {
          $ele.attr("data--num", $ele.find("input").first().val());
        }
        break;
      case "data--disabled":
        if (value) {
          $ele.find("button, input").attr("disabled", "disabled");
        } else {
          $ele.find("button, input").removeAttr("disabled");
          boundaryNum($ele, $ele.data("value"));
        }
        break;
      case "finalize":
        finalizeElement($ele);
        break;
      default:
        console.info("监听到 " + attribute + " 属性值改变为 " + value + ", 但是没找到对应处理动作.");
    }
  };

  // 以下部分不需要修改
  if (!$.wwclass) {
    console.error("Can not use without wwclass.js");
    return false;
  }

  var ret = /*INSBEGIN:WWCLSHANDLER*/
    function (set) {
      if (set.length > 0) {
        loadDependence(function () {
          init();
          $(set).each(function (index, targetDom) {
            processElement($(targetDom));
          });
        });
      }
    }
    /*INSEND:WWCLSHANDLER*/
    ;

  return ret;

}));
