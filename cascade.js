function casecade_get_options(data)
{  
    var html = '';
    
    if (Object.keys(data).length > 0)
    {
        for(var i in data)
        {
            if (typeof data[i] != "undefined" && typeof data[i]["name"] != "undefined")
            {
                html += "<option value=" + data[i]["id"] + ">" + data[i]["name"] + "</option>";
            }
            else
            {
                html += '<optgroup label="' + i + '">';
                html += casecade_get_options(data[i]);
                html += "</optgroup>";
            }
        }
    }
    
    return html;
}

function casecade_fill(obj, data)
{
    if (obj.attr("multiple") != "multiple")
    {
        obj.html("<option value=''>Please Select</option>");
        obj.append(casecade_get_options(data));
    }
    else
    {
        obj.html(casecade_get_options(data));
    }
}

function casecade_href(href, v)
{
    var len = href.length;
    var start = 0;
    var list = [];
    for (var i = 0; i < len; i++)
    {
        var str = href.substr(i, 2);
        if (str == "{{")
        {
            start = i;
        }
        else if (str == "}}" && start)
        {
            list.push(href.substr(start, i + 2 - start));
            start = 0;
        }
    }
    
    for (var i in list)
    {
        var place_holder = list[i].trim();
        if (place_holder == "{{v}}")
        {
            href = href.replace(place_holder, v);
        }
        else if (place_holder.indexOf("#") >= 0)
        {
            var selector = place_holder.substr(2, place_holder.length - 4);            
            if (typeof selector != "undefined" && $(selector).length > 0)
            {
                var pv = $(selector).val();
                pv = pv ? pv : 0;

                href = href.replace(place_holder, pv);
            }
        }
    }
    
    return href;
}

$(document).on("change", "select.cascade-list", function(e, opt)
{
    var obj = $(this).attr("cascade-target");
    console.group("Cascade");
    console.log("target : " + obj);
    
    obj = $(obj);
    
    if (obj.length === 0)
    {
        console.error("No Target Found");
        return;
    }
    
    var auto_load = 0;
    if (typeof opt == "undefined" )
    {
        opt = {};
    }
    
    if (typeof opt.pageLoad != "undefined" && opt.pageLoad)
    {
        auto_load = obj.attr("cascade-auto-load");
        if (auto_load != "1")
        {
            return;
        }
    }
    
    var v = $(this).val();
    
    if (v)
    {
        var href = $(this).attr("cascade-href");
        href = casecade_href(href, v);
        
        console.log(href);
        
        $.get(href, function(data, status)
        {
            if(status !== "success")
            {
                console.groupEnd();
                return;
            }

            try
            {
                data = JSON.parse(data);
                console.log("data length : " + Object.keys(data).length);
            }
            catch(e)
            {
                bootbox.alert(data);
                console.groupEnd();
                return;
            }

            casecade_fill(obj, data);
            
            if (auto_load == "1")
            {
                var dv = obj.data("value");
                console.log("value-set : " + dv);
                if (obj.attr("multiple") == "multiple" && typeof dv == "string")
                {
                    dv = dv.split(",");
                }
                
                obj.val(dv);
                
                if (obj.hasClass("chzn-select"))
                {
                    obj.trigger("chosen:updated");
                }
                
                if (!obj.hasClass("cascade-list"))
                {
                    if (obj.hasClass("select2") || obj.hasClass("select2me") )
                    {
                        obj.select2().select("val", dv);
                    }
                }
            }
            
            if (obj.hasClass("cascade-list"))
            {
                obj.trigger("change", opt);                
            }
            else if (typeof opt.onFinish == "function")
            {
                opt.onFinish(obj);
            }
            
            console.groupEnd();
        });
    }
    else
    {
        casecade_fill(obj, {});
        
        if (obj.hasClass("chzn-select"))
        {
            obj.trigger("chosen:updated");
        }
        
        if (obj.hasClass("cascade-list"))
        {
            obj.trigger("change", opt);
        }
        else 
        {
            if (typeof opt.onFinish == "function")
            {
                opt.onFinish(obj);
            }
        }
        
        console.groupEnd();
    }
});
