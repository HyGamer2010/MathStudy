problem_sets = {
    "APCalcAB": {
        rounding: 2,
        "Unit3": [
            "ChainRule",
            "ImplicitDifferentiation"
        ],
        "Unit4": [
            "Linearization",
            "RelatedRates",
            "LHopitals"
        ],
        "Unit5": [
            "SVA"
        ]
    },
    "AdvancedMath": {
        rounding: 2,
        "Unit6": [
            "Laws",
            "AOBT",
            "Vectors",
            "Imaginary"
        ]
    }
}

var cat_to_readable_string = {
    "ChainRule": "Chain rule",
    "ImplicitDifferentiation": "Implicit Differentiation",
    "Linearization": "Linearization",
    "RelatedRates": "Related Rates",
    "SVA": "Distance, velocity, acceleration",
    "Laws": "Laws of Sines and Cosines",
    "AOBT": "Area of Oblique Triangles",
    "Vectors": "Vectors",
    "Imaginary": "Imaginary numbers",
    "LHopitals": "L\'Hopitals"
}

var cur_rounding = 0
var cur_selected_subject = null
var problem_set = ""
var category = ""
var problem_display
var problem_answer
var problem_explanation
var ordered_select
var begin_button
var body
var nav
var aside
var section
var fieldset
var deg2rad = Math.PI/180
var rad2deg = 180/Math.PI
var problems_json_files = {}
var ordered = true

var lenunits = ["m", "ft", "\"in\"", "cm", "km", "mi"]
var timeunits = ["s", "min", "hr"]

var index
var type_index

document.addEventListener('DOMContentLoaded', (event) => {
    problem_display = document.getElementById("problem_display")
    problem_answer = document.getElementById("problem_answer")
    problem_explanation = document.getElementById("problem_explanation")
    nav = document.querySelector("nav")
    aside = document.querySelector("aside")
    body = document.querySelector("body")
    section = document.querySelector("section")
    fieldset = document.querySelector("fieldset")
    ordered_select = document.querySelector("#orderedselect")
    begin_button = document.querySelector("#begin_button")

    load_changelog()
})

problem_types_selected = []

async function load_changelog(){
    var changelog_file = await fetch("Changelog.txt")
    var text = await changelog_file.text()

    var element = document.getElementById("Changelog")

    text.split("\n").forEach(line => {
        if(line.startsWith("|")){
            element.innerHTML += `<span class='sep'>${line.substring(1)}</span><br>`
        }else {
            element.innerHTML += line + "<br>"
        }
    })
}

function select_box(index){
    elements = document.getElementsByClassName("topic")

    var one_selected = false
    for (var el of elements){
        if(elements[0].value == "All" && elements[0].checked){
            el.checked = true
            one_selected = true
        }
        else if(el.checked){
            one_selected = true
        }
    }
    begin_button.hidden = !one_selected
    if(!elements[index].checked){
        elements[0].checked = false
    }
}

function select_menu(from_id, to_id){
    var from = document.getElementById(from_id)
    var to = document.getElementById(to_id)

    from.hidden = true
    to.hidden = false
}
function select_category(problem_set, category){
    select_menu(problem_set, "topicselect")

    var inner = `<legend>Choose Topics to Include</legend>\n<input type='checkbox' value='All' class='topic' onchange='select_box(0)'><label>All</label><br>\n`

    if(category != "Cummulative"){
        var i = 1
        problem_sets[problem_set][category].forEach(topic => {
            inner += `<input type='checkbox' value='${topic}' class='topic' onchange='select_box(${i})'><label>${cat_to_readable_string[topic]}</label><br>\n`
            i++
        })
    }else {
        var i = 1
        Object.entries(problem_sets[problem_set]).forEach(category => {
            if(category[0] != "rounding"){
                inner += `<span class='unitlabel'>--${category[0]}--</span><br>`
                problem_sets[problem_set][category[0]].forEach(topic => {
                    inner += `<input type='checkbox' value='${topic}' class='topic' onchange='select_box(${i})'><label>${cat_to_readable_string[topic]}</label><br>\n`
                    i++
                })
            }
        })
    }

    fieldset.innerHTML = inner

    this.problem_set = problem_set
    this.category = category
}
function set_element(element, hidden){
    document.getElementById(element).hidden = hidden
}
function select_subject(subject){
    if(cur_selected_subject != null){
        set_element(cur_selected_subject, true)
        set_element(cur_selected_subject + "Header", true)
    }
    reset()
    if(subject != "Changelog")
        cur_rounding = problem_sets[subject].rounding
    set_element(subject, false)
    set_element(subject + "Header", false)
    cur_selected_subject = subject
}
function gen_poly_deriv(degree, min_exp = 1, step = 1, first_const = 1){
    terms = [{
        "Constant":first_const,
        "Power":degree
    }]

    for(i = 1; i <= degree - min_exp; i += step){
        var const_max = (i + 1)**1.8
        var constant = Math.round(Math.random() * const_max * first_const)
        var sign = Math.random() > .5 ? 1 : -1
        if(constant == 0){
            continue
        }
        terms.push({
            "Constant":constant * sign,
            "Power":degree - i
        })
    }

    eq = ""
    deriv = ""
    terms.forEach(term => {
        termConst = term["Constant"]
        termPower = term["Power"]
        const_str = (termConst == 1 || termConst == -1) ? "" : (Math.abs(termConst).toString() + "*")
        power_str = termPower == 1 ? "" : `**${termPower}`
        if(termConst < 0){
            const_str = "-" + const_str
        } else {
            const_str = "+" + const_str
        }
        if(termPower > 0){
            eq += `${const_str}x${power_str}`
        } else {
            eq += termConst < 0 ? termConst : "+" + termConst
        }

        deriv_const = termConst * termPower
        deriv_power = termPower - 1;

        deriv_const_str = (deriv_const == 1 || deriv_const == -1) ? "" : (Math.abs(deriv_const).toString() + "*")
        deriv_power_str = deriv_power == 1 ? "" : `**${deriv_power}`
        if(deriv_const != 0){ 
            if(deriv_const < 0){
                deriv_const_str = "-" + deriv_const_str
            } else {
                deriv_const_str = "+" + deriv_const_str
            }
            if(deriv_power > 0){
                deriv += `${deriv_const_str}x${deriv_power_str}`
            } else {
                deriv += deriv_const < 0 ? deriv_const : "+" + deriv_const
            }
        }
    })
    if(eq.startsWith("+")){
        eq = eq.substring(1)
    }
    if(deriv.startsWith("+")){
        deriv = deriv.substring(1)
    }
    return [eq, deriv]
}
function generate_problem(){
    problem_explanation.hidden = true
    document.getElementById("answer_div").hidden = true 

    if(ordered){
        index++
        if(index > 0){
            if(index >= problems.length){
                index = 0
                type_index++
                if(type_index >= problem_types_selected.length){
                    type_index = 0
                }
                problem_type = problem_types_selected[type_index]
                problems = problems_json_files[problem_type].Types
            }
        }
        problem = problems[index]
    } else {
        problem_type = problem_types_selected[Math.floor(Math.random() * problem_types_selected.length)]
        problems = problems_json_files[problem_type].Types
        index = Math.floor(Math.random() * problems.length)
        problem = problems[index]
    }

    replacement_values = {}
    if(cur_selected_subject == "APCalcAB"){
        if(problem_type == "Linearization"){
            if(index == 0){
                fa = Math.round(Math.random() * 12) + 3
                a = fa**2
                
                rand = Math.random()
                if(rand < .5){
                    prev = (fa-1)**2
                    dist = a - prev - 2

                    offset = -(Math.round(Math.random() * dist / 2) + 1)
                } else {
                    prev = (fa+1)**2
                    dist = prev - a - 2

                    offset = (Math.round(Math.random() * dist / 2) + 1)
                }

                x = a + offset

                fprimea = 1/(2 * fa)
                answer = fa + fprimea * (x - a)

                replacement_values["a"] = a
                replacement_values["x"] = x
                replacement_values["f(a)"] = fa
                replacement_values["f'(a)"] = fprimea
                replacement_values["ans"] = answer
            } 
            else if(index == 1){
                while(true){
                    degree = Math.floor(Math.random() * 2 + 2)
                    gen = gen_poly_deriv(degree)
                    var eq = gen[0]
                    var deriv = gen[1]

                    root = Math.random() < .6 ? 2 : 3

                    a = Math.floor(Math.random() * (12 - (degree * root**2 / 2)) + 3)
                    a *= Math.random() < .5 ? -1 : 1
                    
                    eq_a = eq.replaceAll("x", `(${a})`)

                    cur_val = eval(eq_a)

                    if(cur_val <= 0){
                        continue
                    }

                    prev_val = Math.floor(cur_val**(1/root))**root
                    next_val = Math.ceil(cur_val**(1/root))**root

                    desired_val = Math.random() > .5 ? prev_val : next_val

                    offset = desired_val - cur_val
                    if(offset == 0){
                        continue
                    }
                    eq += offset < 0 ? offset.toString() : "+" + offset.toString()

                    if(root == 2){
                        final_eq = `(${eq})**(1/2)`
                        final_deriv = `(1/(2 * (${eq})**(1/2))) * (${deriv})`
                    } else {
                        final_eq = `(${eq})**(1/3)`
                        final_deriv = `(1/(3 * (${eq})**(2/3))) * (${deriv})`
                    }

                    eq_a = final_eq.replaceAll("x", `(${a})`)
                    deriv_a = final_deriv.replaceAll("x", `(${a})`)

                    fprimea = eval(deriv_a)

                    x = a + Math.round(Math.random() * 10) / 20 * (Math.random() > .5 ? 1 : -1)
                    fa = desired_val**(1/root)

                    replacement_values["a"] = a
                    replacement_values["x"] = x
                    replacement_values["f(a)"] = fa
                    replacement_values["f'(a)"] = fprimea
                    replacement_values["eq"] = final_eq.replaceAll("**", "^").replaceAll("*x", "x").replaceAll("*(", "(")
                    replacement_values["deriv"] = final_deriv.replaceAll("**", "^").replaceAll("*x", "x").replaceAll("*(", "(")
                    replacement_values["eqa"] = eq_a.replaceAll("**", "^").replaceAll("*x", "x").replaceAll("*(", "(")
                    replacement_values["deriva"] = deriv_a.replaceAll("**", "^").replaceAll("*x", "x").replaceAll("*(", "(")
                    replacement_values["ans"] = fa + fprimea * (x - a)

                    break;
                }
            }
        }
        else if(problem_type == "RelatedRates"){
            var lenunit = lenunits[Math.floor(Math.random() * lenunits.length)]
            var timeunit = timeunits[Math.floor(Math.random() * timeunits.length)]

            if(index == 0){
                var side = Math.floor(Math.random() * 10) + 1
                var dsdt = Math.floor(Math.random() * 20) / 10 + 1

                var dadt = 2 * side * dsdt

                replacement_values["side"] = side
                replacement_values["ds/dt"] = dsdt
                replacement_values["dA/dt"] = dadt
                replacement_values["lenunit"] = lenunit
                replacement_values["timeunit"] = timeunit
            }
            else if(index == 1){
                var radius = Math.floor(Math.random() * 10) + 1
                var drdt = Math.floor(Math.random() * 20) / 10 + 1

                var dadt = 2 * radius * drdt

                replacement_values["radius"] = radius
                replacement_values["dr/dt"] = drdt
                replacement_values["dA/dt"] = dadt
                replacement_values["lenunit"] = lenunit
                replacement_values["timeunit"] = timeunit
            }
            else if(index == 2){
                var time = Math.floor(Math.random() * 100) / 10 + 1
                var drdt = Math.floor(Math.random() * 20) / 10 + 1
                var radius = drdt * time

                var dadt = 2 * radius * drdt

                replacement_values["radius"] = radius
                replacement_values["time"] = time
                replacement_values["dr/dt"] = drdt
                replacement_values["dA/dt"] = dadt
                replacement_values["lenunit"] = lenunit
                replacement_values["timeunit"] = timeunit
            }
            else if(index == 3){
                var radius = Math.floor(Math.random() * 20) + 1
                var drdt = Math.floor(Math.random() * 100) / 100 + .01

                var dvdt = 4 * radius**2 * drdt

                replacement_values["radius"] = radius
                replacement_values["dr/dt"] = drdt
                replacement_values["dV/dt"] = dvdt
                replacement_values["lenunit"] = lenunit
                replacement_values["timeunit"] = timeunit
            }
            else if(index == 4){
                var radius = Math.floor(Math.random() * 10) + 1
                var dvdt = Math.floor(Math.random() * 30) / 10 + 1

                var drdt = dvdt/(4 * radius**2)

                replacement_values["radius"] = radius
                replacement_values["dr/dt"] = drdt
                replacement_values["dV/dt"] = dvdt
                replacement_values["lenunit"] = lenunit
                replacement_values["timeunit"] = timeunit
            }
            else if(index == 5){
                var x = Math.floor(Math.random() * 10 + 1) / 10
                var dydt = Math.floor(Math.random() * 50) / 10 + 1

                var dxdt = dydt * (2*x**(1/2))

                replacement_values["x"] = x
                replacement_values["dy/dt"] = dydt
                replacement_values["dx/dt"] = dxdt
                replacement_values["timeunit"] = timeunit
            }
            else if(index == 6){
                while(true){
                    var geny = gen_poly_deriv(3, 1, 2, Math.floor(Math.random() * 3) + 1)
                    var genx = gen_poly_deriv(Math.random() > .5 ? 2 : 1, 0, 1, Math.floor(Math.random() * 3) + 1)
                    var x = Math.floor(Math.random() * 10) - 4
                    var eqy = geny[0]
                    var derivy = geny[1]
                    var ineqy = eqy.replaceAll(`x`, `(${x})`)
                    var y = eval(ineqy)
                    var inderivy = derivy.replaceAll(`x`, `(${x})`)
                    var dydt = eval(inderivy)
                    if(Math.abs(y) >= 10 || Math.abs(y) <= 4){
                        continue;
                    }
                    tocontinue = false
                    for(i = -10; i <= 10; i++){
                        if(i == x){
                            continue
                        }
                        var thisy = eval(eqy.replaceAll(`x`, `(${i})`))
                        if(thisy == y){
                            tocontinue = true
                            break
                        }
                    }
                    if(tocontinue){
                        continue
                    }

                    var eqx = genx[0]
                    var ineqx = eqx.replaceAll(`x`, `(${x})`)
                    var dxdt = eval(ineqx)
                    if(dxdt == 0){
                        continue
                    }

                    var ans = dydt * dxdt

                    replacement_values["x"] = x
                    replacement_values["eqx"] = eqx.replaceAll("**", "^")
                    replacement_values["ineqx"] = ineqx.replaceAll("**", "^")
                    replacement_values["y"] = y
                    replacement_values["eqy"] = eqy.replaceAll("**", "^")
                    replacement_values["derivy"] = derivy.replaceAll("**", "^")
                    replacement_values["ineqy"] = ineqy.replaceAll("**", "^")
                    replacement_values["inderivy"] = inderivy.replaceAll("**", "^")
                    replacement_values["dy/dt"] = dydt
                    replacement_values["dx/dt"] = dxdt
                    replacement_values["ans"] = ans
                    break
                }
            }
            else if(index == 7){
                var x = Math.floor(Math.random() * 10 + 1) * 10
                var y = Math.floor(Math.random() * 10 + 1) * 10
                var d = (x**2+y**2)**(1/2)
                var dydt = Math.floor(Math.random() * 20 + 1)

                var dddt = (y*dydt)/d

                replacement_values["x"] = x
                replacement_values["y"] = y
                replacement_values["d"] = d
                replacement_values["dy/dt"] = dydt
                replacement_values["dd/dt"] = dddt
                replacement_values["timeunit"] = timeunit
                replacement_values["lenunit"] = lenunit
            }
            else if(index == 8){
                var mh = Math.floor(Math.random() * 5 + 1)
                var lh = Math.floor(Math.random() * 5 + mh + 3)
                var dxdt = Math.floor(Math.random() * 20)/10 + 1
                var x = Math.floor(Math.random() * 20 + 1)

                var dsdt = (dxdt/lh) / ((1/mh) - (1/lh))

                replacement_values["x"] = x
                replacement_values["mh"] = mh
                replacement_values["lh"] = lh
                replacement_values["dx/dt"] = dxdt
                replacement_values["ds/dt"] = dsdt
                replacement_values["timeunit"] = timeunit
                replacement_values["lenunit"] = lenunit
            }
            else if(index == 9){
                var x = Math.floor(Math.random() * 40 + 11)
                var y = Math.floor(Math.random() * 20 + 11)
                var d = (x**2+y**2)**(1/2)
                var dddt = Math.floor(Math.random() * 40 + 11)

                var dxdt = (d*dddt)/x

                replacement_values["x"] = x
                replacement_values["y"] = y
                replacement_values["d"] = d
                replacement_values["dx/dt"] = dxdt
                replacement_values["dd/dt"] = dddt
                replacement_values["timeunit"] = timeunit
                replacement_values["lenunit"] = lenunit
            }
            else if(index == 10){
                var e = Math.floor(Math.random() * 10 + 1) * 10
                var s = Math.floor(Math.random() * 10 + 1) * 10
                var d = (e**2+s**2)**(1/2)
                var dedt = Math.floor(Math.random() * 20 + 11)
                var dsdt = Math.floor(Math.random() * 20 + 11)

                var dddt = (e * dedt + s * dsdt) / d

                replacement_values["e"] = e
                replacement_values["s"] = s
                replacement_values["d"] = d
                replacement_values["de/dt"] = dedt
                replacement_values["ds/dt"] = dsdt
                replacement_values["dd/dt"] = dddt
                replacement_values["timeunit"] = timeunit
                replacement_values["lenunit"] = lenunit
            }
            else if(index == 11){
                var dcdt = Math.floor(Math.random() * 10 + 1) * 10
                var dbdt = Math.floor(Math.random() * 10 + 1) * 10
                var t = Math.floor(Math.random() * 4 + 1) * 5
                var c = dcdt * t * 2
                var b = dbdt * t
                var d = (c**2+b**2)**(1/2)

                var dddt = (c * dcdt + b * dbdt) / d

                replacement_values["c"] = c
                replacement_values["b"] = b
                replacement_values["d"] = d
                replacement_values["t"] = t
                replacement_values["dc/dt"] = dcdt
                replacement_values["db/dt"] = dbdt
                replacement_values["dd/dt"] = dddt
                replacement_values["timeunit"] = timeunit
                replacement_values["lenunit"] = lenunit
            }
        }
        else if(problem_type == "ChainRule"){
            if(index == 0){
                var op = Math.floor(Math.random() * 4)
                var outside
                var inside
                if(op == 0){
                    var deg = Math.floor(Math.random() * 4 + 2)
                    outside = `x^${deg}`
                    out_deriv = `${deg}x^${deg - 1}`
                }
                else if(op == 1){
                    var trig_funcs = ["sin", "cos", "tan", "csc", "sec", "cot", "sin^-1", "cos^-1", "tan^-1", "csc^-1", "sec^-1", "cot^-1"]
                    var trig_derivs = ["cosx", "-sinx", "sec^2x", "-cscxcotx", "secxtanx", "-csc^2x", "1/(sqrt(1-x^2))", "-1/(sqrt(1-x^2))", "1/(1+x^2)", "-1/(abs(x)sqrt(x^2-1))", "1/(abs(x)sqrt(x^2-1))", "-1/(1+x^2)"]
                    var trig_op = Math.floor(Math.random() * 12)
                    outside = `${trig_funcs[trig_op]}x`
                    out_deriv = trig_derivs[trig_op]
                }
                else if(op == 2){
                    var base = Math.floor(Math.random() * 9 + 2)
                    var log_funcs = [`log_${base}`, `ln`]
                    var log_derivs = [`1/(xln(${base}))`, "1/x"]

                    var log_op = Math.floor(Math.random() * 2)
                    outside = `${log_funcs[log_op]}x`
                    out_deriv = log_derivs[log_op]
                }
                else if(op == 3){
                    var base = Math.floor(Math.random() * 4 + 2)

                    outside = `${base}^x`
                    out_deriv = `${outside}ln(${base})`
                }
                var degree = Math.floor(Math.random() * 2 + 2)
                var in_vals = gen_poly_deriv(degree=degree, min_exp=0)
                inside = in_vals[0].replaceAll("**", "^").replaceAll("*x", "x")
                in_deriv = in_vals[1].replaceAll("**", "^").replaceAll("*x", "x")
                var highout = `<span class='bold'>\`${outside.replace("x", `\"(\"\`</span>\`${inside}\`<span class='bold'>\`\")\"`)}\`</span>`
                var highin = outside.replace("x", `(\`<span class='bold'>\`${inside}\`</span>\`)`)
                var eq = outside.replaceAll("x", `(${inside})`).replaceAll("**", "^").replaceAll("*x", "x")
                var deriv = `${out_deriv.replaceAll("x", `(${inside})`)}*(${in_deriv})`.replaceAll("**", "^").replaceAll("*x", "x")

                console.log(highout, highin)

                replacement_values["out_deriv"] = out_deriv
                replacement_values["in_deriv"] = in_deriv
                replacement_values["outside"] = outside
                replacement_values["inside"] = inside
                replacement_values["eq"] = eq
                replacement_values["deriv"] = deriv
                replacement_values["highout"] = highout
                replacement_values["highin"] = highin
            }
        }
        else if(problem_type == "ImplicitDifferentiation"){
            if(index == 0){
                var termsLeftCount = Math.max(Math.floor(Math.random() * 6) - 2, 1)
                var termsRightCount = Math.max(Math.floor(Math.random() * 6) - 2, 1)

                var termsLeft = []
                var termsRight = []
                var derivsLeft = []
                var derivsRight = []

                var yChance = 1

                var leftbreakdown = ""
                var rightbreakdown = ""

                for(i = 0; i < termsLeftCount; i++){
                    var constant = Math.floor(Math.random() * 5 + 1)
                    var xpow = termsLeftCount - i + 1
                    var ypow = 0
                    if(Math.floor(Math.random() * yChance) == 0){
                        ypow = Math.max(Math.floor(Math.random() * 3) + 1)
                        yChance++
                    } else {
                        ypow = 0
                    }
                    var term = `${constant}x^${xpow}y^${ypow}`.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    var deriv1 = `${xpow * constant}x^${xpow-1}y^${ypow}`.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    var deriv2 = `${constant*ypow}x^${xpow}y^${ypow - 1}y'`.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    leftbreakdown += `<br>--<br>
                    \`d/dx[${term}] = ${constant}(${xpow}x^${xpow-1}y^${ypow}${deriv2.includes("0") ? "" : `+${ypow}x^${xpow}y^${ypow - 1}y'`})\`<br>
                    \`d/dx[${term}] = ${deriv1}${deriv2.includes("0") ? "" : `+${deriv2}`}\``.replaceAll("x^0", "").replaceAll("y^0", "")
                    termsLeft.push(term)
                    derivsLeft.push(deriv1, deriv2)
                }
                for(i = 0; i < termsRightCount; i++){
                    var constant = Math.floor(Math.random() * 5 + 1)
                    var xpow = termsRightCount - i + 1
                    var ypow = 0
                    if(Math.floor(Math.random() * yChance) == 0){
                        ypow = Math.max(Math.floor(Math.random() * 3) + 1)
                        yChance++
                    } else {
                        ypow = 0
                    }
                    var term = `${constant}x^${xpow}y^${ypow}`.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    var deriv1 = `${xpow * constant}x^${xpow-1}y^${ypow}`.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    var deriv2 = `${constant*ypow}x^${xpow}y^${ypow - 1}y'`.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    rightbreakdown += `<br>--<br>\`d/dx[${term}] = ${constant}(${xpow}x^${xpow-1}y^${ypow}${deriv2.includes("0") ? "" : `+${ypow}x^${xpow}y^${ypow - 1}y'`})\`<br>\`d/dx[${term}] = ${deriv1}${deriv2.includes("0") ? "" : `+${deriv2}`}\`<br>`.replaceAll("x^0", "").replaceAll("y^0", "")
                    termsRight.push(term)
                    derivsRight.push(deriv1, deriv2)
                }
                for(i = 0; i < termsLeftCount; i++){
                    var highlighted = ""
                    for(f = 0; f < termsLeftCount; f++){
                        var term = termsLeft[f]
                        if(i == f){
                            highlighted += `\`+\`<span class='bold'>\`${term}\`</span>`
                        } else{
                            highlighted += `\`+\`\`${term}\``
                        }
                    }
                    leftbreakdown = leftbreakdown.replace("--", `\`d/dx[\`${highlighted.substring(3)}\`]\``)
                }
                for(i = 0; i < termsRightCount; i++){
                    var highlighted = ""
                    for(f = 0; f < termsRightCount; f++){
                        var term = termsRight[f]
                        if(i == f){
                            highlighted += `\`+\`<span class='bold'>\`${term}\`</span>`
                        } else{
                            highlighted += `\`+\`\`${term}\``
                        }
                    }
                    rightbreakdown = rightbreakdown.replace("--", `\`d/dx[\`${highlighted.substring(3)}\`]\``)
                }
                replacement_values["leftbreakdown"] = leftbreakdown
                replacement_values["rightbreakdown"] = rightbreakdown
                var left_str = ""
                var right_str = ""
                for(term of termsLeft){
                    term = term.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    if(!term.startsWith("0"))
                        left_str += `+${term}`
                }
                for(term of termsRight){
                    term = term.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    if(!term.startsWith("0"))
                        right_str += `+${term}`
                }
                left_str = left_str.substring(1)
                right_str = right_str.substring(1)
                replacement_values["termsLeft"] = left_str
                replacement_values["termsRight"] = right_str
                left_str = ""
                right_str = ""
                movedLeft = ""
                movedRight = ""
                for(deriv of derivsLeft){
                    deriv = deriv.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    if(deriv.startsWith("0")){
                        continue
                    }
                    left_str += `+${deriv}`
                    if(deriv.includes("y'")){
                        movedLeft += `+${deriv}`
                    } else {
                        movedRight += `-(${deriv})`
                    }
                }
                for(deriv of derivsRight){
                    deriv = deriv.replaceAll("^1", "").replaceAll("x^0", "").replaceAll("y^0", "")
                    if(deriv.startsWith("0")){
                        continue
                    }
                    right_str += `+${deriv}`
                    if(deriv.includes("y'")){
                        movedLeft += `-(${deriv})`
                    } else {
                        movedRight += `+${deriv}`
                    }
                }
                if(left_str.startsWith("+")){
                    left_str = left_str.substring(1)
                }
                if(right_str.startsWith("+")){
                    right_str = right_str.substring(1)
                }
                if(movedLeft.startsWith("+")){
                    movedLeft = movedLeft.substring(1)
                }
                if(movedRight.startsWith("+")){
                    movedRight = movedRight.substring(1)
                }
                replacement_values["derivsLeft"] = left_str
                replacement_values["derivsRight"] = right_str
                replacement_values["movedLeft"] = movedLeft
                replacement_values["movedRight"] = movedRight
    
                var deriv = `(${movedRight})/(${movedLeft.replaceAll("y'", "")})`
                replacement_values["deriv"] = deriv
            }
        }
        else if(problem_type == "SVA"){
            if(index == 0){
                var points_ct = Math.floor(Math.random() * 2 + 5)
                var dist_between_pts = 10/(points_ct - 1)
                var pts = []
                var derivs = []

                for(i = 0; i < points_ct; i++){
                    pts.push([i * dist_between_pts, Math.floor(Math.random() * 10 + 1) * (Math.random() > .5 ? 1 : -1)])
                }

                var pts_str = ""
                var deriv_str = ""

                for(i = 0; i < points_ct; i++){
                    pts_str += `,[${pts[i][0]},${pts[i][1]}]`
                    if(i < points_ct - 1){
                        var slope = (pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0])
                        derivs.push(slope)
                        deriv_str += `,[[${pts[i][0]},${slope}],[${pts[i+1][0]},${slope}]]`
                    }
                }

                var velo = [...derivs].sort((a, b) => b - a)[0]
                var speed = Math.abs([...derivs].sort((a, b) => Math.abs(b) - Math.abs(a))[0])

                var velo_intervals = ""
                var speed_intervals = ""
                var explanation = ""
                for(i = 0; i < points_ct - 1; i++){
                    explanation += `The slope on the interval \`(${pts[i][0]},${pts[i + 1][0]})\` is \`${pts[i + 1][1] - pts[i][1]}/${pts[i + 1][0] - pts[i][0]}\` or \`${derivs[i]}\`<br>`
                    if(derivs[i] == velo){
                        velo_intervals += `uu(${pts[i][0]},${pts[i + 1][0]})`
                    }
                    if(Math.abs(derivs[i]) == speed){
                        speed_intervals += `uu(${pts[i][0]},${pts[i + 1][0]})`
                    }
                }

                replacement_values["fpoints"] = `[${pts_str.substring(1)}]`
                replacement_values["dpoints"] = `[${deriv_str.substring(1)}]`
                replacement_values["explanation"] = explanation
                replacement_values["veloints"] = `\`${velo_intervals.substring(2)}\``
                replacement_values["speedints"] = `\`${speed_intervals.substring(2)}\``
                replacement_values["velo"] = velo
                replacement_values["speed"] = speed
            }
            else if(index == 1){
                var change_ct = Math.floor(Math.random() * 2 + 1)
                var start = -Math.floor(Math.random() * 5 + (5 * change_ct))
                var end = Math.floor(Math.random() * 5 + (5 * change_ct) + 1)

                var changes = []
                var changes_str = ""
                var factors = []
                var factors_str = ""

                for(i = 0; i < change_ct; i++){
                    if(change_ct == 1){
                        var change = Math.floor(Math.random() * (end - start - 1) + start + 1)
                        var coefficient = Math.floor(Math.random() * 3 + 1)
                    } 
                    else{
                        var coefficient = 1
                        if(i == 0) {
                            var change = Math.floor(Math.random() * ((end - start)/2 - 1) + start + 1)
                        }
                        else if(i == 1) {
                            var change = Math.floor(Math.random() * ((end - start)/2 - 1) + (end - start)/2 + start + 1)
                        }
                    }
                    changes.push(change)
                    factors.push({
                        coefficient: coefficient,
                        constant: -(change * coefficient)
                    })
                    changes_str += `, ${change}`
                    factors_str += `(${coefficient}t${coefficient * change > 0 ? "" : "+"}${-(change * coefficient)})`
                }
                factors_str = factors_str.replaceAll("+0", "")

                var st
                var vt
                if(factors.length == 1){
                    var first = factors[0].coefficient/2
                    var b = factors[0].constant
                    st = `${Math.round(first) == first ? first : `${factors[0].coefficient}/2`}t^2${b > 0 ? "+" : ""}${b}t+${Math.floor(Math.random() * 10 + 1)}`
                    vt = factors_str
                } else {
                    var va = factors[0].coefficient * factors[1].coefficient
                    var vb = factors[0].coefficient * factors[1].constant + factors[1].coefficient * factors[0].constant
                    var vc = factors[0].constant * factors[1].constant

                    var sa = va/3
                    var sb = vb/2
                    st = `${Math.round(sa) == sa ? sa : `${va}/2`}t^3${sb > 0 ? "+" : ""}${Math.round(sb) == sb ? sb : `${vb}/2`}t^2${vc > 0 ? "+" : ""}${vc}t+${Math.floor(Math.random() * 20 + 1)}`
                    vt = `${va}t^2${vb > 0 ? "+" : ""}${vb}t${vc >= 0 ? "+" : ""}${vc}`
                }

                st = st.replaceAll("0t^3", "").replaceAll("0t^2", "").replaceAll("0t", "")
                vt = vt.replaceAll("0t^2", "").replaceAll("0t", "").replaceAll("+0", "")

                var st_eval_eq = st.replaceAll("^", "**").replaceAll("t", "*t")
                var func_calcs = [[start, eval(st_eval_eq.replaceAll("t", `(${start})`))], [end, eval(st_eval_eq.replaceAll("t", `(${end})`))]]
                var middle_str = ""
                for(i = 0; i < change_ct; i++){
                    var val = eval(st_eval_eq.replaceAll("t", `(${changes[i]})`))
                    func_calcs.push([changes[i], val])
                    middle_str += `\`s(${changes[i]}) = ${val}\`<br>`
                }
                var func_calcs_str = `\`s(${start}) = ${func_calcs[0][1]}\`<br>${middle_str}\`s(${end}) = ${func_calcs[1][1]}\``
                var dist_calcs = []
                var dist_calcs_str = ""
                var dist_str = ""
                ordered_funcs = func_calcs.sort((a, b) => b[0] - a[0])
                for(i = ordered_funcs.length - 1; i > 0; i--){
                    var dist = Math.abs(ordered_funcs[i][1] - ordered_funcs[i - 1][1])
                    dist_calcs_str += `<br>\`abs(${ordered_funcs[i][1]} - (${ordered_funcs[i - 1][1]})) = ${dist}\``
                    dist_calcs.push(dist)
                    dist_str += `+${dist}`
                }
                dist = 0
                for(d of dist_calcs){
                    dist += d
                }
                dist_calcs_str += `<br>\`${dist_str.substring(1)}=${dist}\``
                func_calcs = func_calcs.sort((a, b) => a[1] - b[1])
                replacement_values["positions"] = changes_str.substring(2)
                replacement_values["factors"] = factors_str
                replacement_values["funccalcs"] = func_calcs_str
                replacement_values["distcalcs"] = dist_calcs_str
                replacement_values["min"] = func_calcs[0][1]
                replacement_values["max"] = func_calcs[func_calcs.length - 1][1]
                replacement_values["s(t)"] = st
                replacement_values["v(t)"] = vt
                replacement_values["end"] = end
                replacement_values["start"] = start
                replacement_values["distance"] = dist
            }
            else if(index == 2){
                var gen = gen_poly_deriv(Math.floor(Math.random() * 2 + 2))[0].replaceAll("x", "t")
                var a = Math.floor(Math.random() * 11) * (Math.random() > .5 ? 1 : -1)
                var b = Math.floor(Math.random() * 20 + a + 5)

                var sa = eval(gen.replaceAll("t", `(${a})`))
                var sb = eval(gen.replaceAll("t", `(${b})`))

                replacement_values["a"] = a
                replacement_values["b"] = b
                replacement_values["s(a)"] = sa
                replacement_values["s(b)"] = sb
                replacement_values["displacement"] = sb - sa
                replacement_values["avg"] = (sb - sa)/(b - a)
                replacement_values["s(t)"] = gen.replaceAll("**", "^").replaceAll("*t", "t")
            }
            else if(index == 3){
                var st = ""
                var vt = ""
                var at = ""
                var t = Math.floor(Math.random() * 5 + 1) * (Math.random() > .5 ? 1 : -1)
                for(i = 3; i >= 0; i--){
                    var coeff = Math.floor(Math.random() * 4 + 1) * (Math.random() > .5 ? 1 : -1)
                    var vpow = i - 1
                    var apow = vpow - 1
                    st += `${coeff > 0 ? "+" : ""}${coeff}${i == 0 ? "" : `*t${i == 1 ? "" : `**${i}`}`}`
                    if(vpow >= 0){
                        vt += `${coeff > 0 ? "+" : ""}${coeff * i}${vpow == 0 ? "" : `*t${vpow == 1 ? "" : `**${vpow}`}`}`
                    }
                    if(apow >= 0){
                        at += `${coeff > 0 ? "+" : ""}${coeff * i * vpow}${apow == 0 ? "" : `*t${apow == 1 ? "" : `**${apow}`}`}`
                    }
                }
                var invt = vt.replaceAll("t", `(${t})`)
                var inat = at.replaceAll("t", `(${t})`)
    
                replacement_values["s(t)"] = st.replaceAll("**", "^").replaceAll("*t", "t")
                replacement_values["v(t)"] = vt.replaceAll("**", "^").replaceAll("*t", "t")
                replacement_values["a(t)"] = at.replaceAll("**", "^").replaceAll("*t", "t")
                replacement_values["inv(t)"] = invt.replaceAll("**", "^").replaceAll("*(", "(")
                replacement_values["ina(t)"] = inat.replaceAll("**", "^").replaceAll("*(", "(")
                replacement_values["t"] = t
                replacement_values["velo"] = eval(invt)
                replacement_values["acc"] = eval(inat)
            }
        }
        else if(problem_type == "LHopitals"){
            var num_of_steps = Math.floor(Math.random() * 2 + 2)
            
            var num_op = Math.floor(Math.random() * 1)
            if(num_op == 0){
                while(true){
                    var n = Math.floor(Math.random() * 3) * (Math.random() > .5 ? 1 : -1)
                    var numers = []
                    var pow = Math.floor(Math.random() * num_of_steps + 1)
                    var consts = []
                    for(i = 3; i >= 0; i--){
                        consts.push(Math.floor(Math.random() * i**1.8 + 1) * (Math.random() > .5 ? 1 : -1))
                    }
                    for(i = 0; i < num_of_steps; i++){
                        var numer = ""
                        for(p = pow - i; p >= 0; p--){
                            var constant = consts[p + i]
                            numer += `${constant > 0 ? "+" : ""}${constant}${p == 0 ? "" : `*x${p == 1 ? "" : `**${p}`}`}`
                            constant *= p
                            consts[p + i] = constant
                        }
                        var val = eval(numer.replaceAll("x", `(${n})`))
                        if(val != 0 && i < num_of_steps - 1){
                            break
                        }else {
                            numers.push(numer.startsWith("-") ? numer : numer.substring(1))
                        }
                    }
                    console.log(numers)
                    if(numers.length == num_of_steps){
                        break
                    }
                }
            }
            var den_op = Math.floor(Math.random() * 1)
            if(den_op == 0){
                while(true){
                    var steps = []
                    var pow = Math.floor(Math.random() * num_of_steps + 2)
                    var consts = []
                    var done = 0
                    for(i = 4; i >= 0; i--){
                        consts.push(Math.floor(Math.random() * i**1.8 + 1) * (Math.random() > .5 ? 1 : -1))
                    }
                    for(i = 0; i < num_of_steps; i++){
                        var denom = ""
                        for(p = pow - i; p >= 0; p--){
                            var constant = consts[p + i]
                            denom += `${constant > 0 ? "+" : ""}${constant}${p == 0 ? "" : `*x${p == 1 ? "" : `**${p}`}`}`
                            constant *= p
                            consts[p + i] = constant
                        }
                        var val = eval(denom.replaceAll("x", `(${n})`))
                        if((val == 0 && i == num_of_steps - 1) || (val != 0 && i < num_of_steps - 1) || (denom == numers[i])){
                            console.log(denom, numers[i])
                            break
                        }else {
                            steps[i] = `(${numers[i]})/(${denom.startsWith("-") ? denom : denom.substring(1)})`
                            done++
                        }
                    }
                    if(done == num_of_steps){
                        break
                    }
                }
            }

            explanation = ""
            for(i = 0; i < num_of_steps - 1; i++){
                var step = steps[i]
                explanation += `Substitute \`${n}\` into the equation:<br>
                \`${step.replaceAll("**", "^").replaceAll("*x", "x").replaceAll("1x", "x").replaceAll("x", `(${n})`)}\`<br>
                \`0/0\`<br>
                So take the derivative:<br>
                \`${steps[i + 1].replaceAll("**", "^").replaceAll("*x", "x").replaceAll("1x", "x")}\`<br>`
            }

            var step = steps[num_of_steps - 1]
            var ans = eval(step.replaceAll("x", `(${n})`))
            explanation += `Substitute \`${n}\` into the equation:<br>
            \`${step.replaceAll("**", "^").replaceAll("*x", "x").replaceAll("1x", "x").replaceAll("x", `(${n})`)}\`<br>
            \`!=0/0\`
            Evaluate<br>
            \`${ans}\`<br>`
            
            replacement_values["eq"] = steps[0].replaceAll("**", "^").replaceAll("*x", "x").replaceAll("1x", "x")
            replacement_values["n"] = n
            replacement_values["ans"] = ans
            replacement_values["explanation"] = explanation
        }
    }
    else if(cur_selected_subject == "AdvancedMath"){
        if(problem_type == "Laws" || problem_type == "AOBT"){
            var a1 = ""
            var b1 = ""
            var c1 = ""
            var A1 = ""
            var B1 = ""
            var C1 = ""

            var a2 = ""
            var b2 = ""
            var c2 = ""
            var A2 = ""
            var B2 = ""
            var C2 = ""

            var a3 = ""
            var b3 = ""
            var c3 = ""
            var A3 = ""
            var B3 = ""
            var C3 = ""

            var side1 = ""
            var angle1 = ""
            var angle2 = ""
            var angle3 = ""
            var side2 = ""
            var side3 = ""
            var angle2v2 = ""
            var angle3v2 = ""
            var side3v2 = ""

            var si1 = ""
            var an1 = ""
            var an2 = ""
            var an3 = ""
            var si2 = ""
            var si3 = ""

            var shows1 = false
            var shows2 = false
            var shows3 = false
            var showa1 = false
            var showa2 = false
            var showa3 = false
            if(problem_type == "Laws"){
                if(index == 0){
                    shows1 = true
                    showa1 = true
                    showa2 = true
                    side1 = Math.floor(Math.random() * 15 + 1)
                    angle1 = Math.floor(Math.random() * 90 + 21)
                    angle2 = Math.floor(Math.random() * (140 - angle1) + 21)
                    angle3 = 180 - angle1 - angle2
                    side2 = (side1 * Math.sin(angle2 * deg2rad)/Math.sin(angle1 * deg2rad))
                    side3 = (side1 * Math.sin(angle3 * deg2rad)/Math.sin(angle1 * deg2rad))
                }
                else if(index == 1){
                    shows1 = true
                    showa1 = true
                    shows2 = true
                    side2 = Math.floor(Math.random() * 9 + 1)
                    side1 = Math.floor(Math.random() * (13 - side2) + 1) + side2 + 1
                    angle1 = Math.floor(Math.random() * 90 + 21)
                    angle2 = Math.asin(side2 * Math.sin(angle1 * deg2rad) / side1) * rad2deg
                    angle3 = 180 - angle1 - angle2
                    side3 = (side1 * Math.sin(angle3 * deg2rad)/Math.sin(angle1 * deg2rad))
                } 
                else if(index == 2){
                    shows1 = true
                    showa1 = true
                    shows2 = true
                    angle1 = Math.floor(Math.random() * 50 + 21)
                    side2 = Math.floor(Math.random() * 9 + 6)
                    var height = side2 * Math.sin(angle1 * deg2rad)
                    side1 = Math.floor(height * .75)
                    replacement_values["h"] = height
                }
                else if(index == 3){
                    shows1 = true
                    showa1 = true
                    shows2 = true
                    angle1 = Math.floor(Math.random() * 50 + 21)
                    side2 = Math.floor(Math.random() * 9 + 6)
                    var height = side2 * Math.sin(angle1 * deg2rad)
                    side1 = Math.floor(Math.random() * (side2 - height) * .8) + height + 1

                    angle2 = Math.asin(side2 * Math.sin(angle1 * deg2rad) / side1) * rad2deg
                    angle3 = 180 - angle1 - angle2
                    side3 = (side1 * Math.sin(angle3 * deg2rad)/Math.sin(angle1 * deg2rad))

                    angle2v2 = 180 - angle2
                    angle3v2 = 180 - angle1 - angle2v2
                    side3v2 = (side1 * Math.sin(angle3v2 * deg2rad)/Math.sin(angle1 * deg2rad))

                    replacement_values["h"] = height
                }
                else if(index == 4){
                    shows1 = true
                    shows2 = true
                    showa3 = true
                    side1 = Math.floor(Math.random() * 15 + 1)
                    side2 = Math.floor(Math.random() * 15 + 1)
                    angle3 = Math.floor(Math.random() * 100 + 21)

                    side3 = (side1**2+side2**2-2 * (side1) * (side2) * Math.cos(angle3 * deg2rad))**(1/2)
                    angle2 = Math.asin(side2 * Math.sin(angle3 * deg2rad) / side3) * rad2deg
                    angle1 = 180 - angle2 - angle3
                }
                else if(index == 5){
                    shows1 = true
                    shows2 = true
                    shows3 = true
                    side1 = Math.floor(Math.random() * 12 + 1)
                    side2 = Math.floor(Math.random() * (Math.floor(side1 / 2.5)) + 1) + side1
                    side3 = Math.floor(Math.random() * (Math.floor(side1 / 2.5)) + 1) + side2
                    angle3 = Math.acos((-1 * (side3)**2+side1**2+side2**2)/(2 * side1 * side2)) * rad2deg
                    angle2 = Math.asin(side2 * Math.sin(angle3 * deg2rad) / side3) * rad2deg
                    angle1 = 180 - angle2 - angle3
                }
            }
            else if(problem_type == "AOBT") {
                if(index == 0){
                    shows1 = true
                    shows2 = true
                    showa3 = true
                    side1 = Math.floor(Math.random() * 15 + 1)
                    side2 = Math.floor(Math.random() * 15 + 1)
                    angle3 = Math.floor(Math.random() * 100 + 21)

                    var area = side1 * side2 * Math.sin(angle3 * deg2rad)/2
                    replacement_values["A"] = area
                }
                else if(index == 1){
                    shows1 = true
                    shows2 = true
                    shows3 = true
                    side1 = Math.floor(Math.random() * 12 + 1)
                    side2 = Math.floor(Math.random() * 12 + 1)
                    side3 = Math.floor(Math.random() * (12 - Math.abs(side1 - side2)/2) + 1)
                    var s = (side1 + side2 + side3)/2
                    var area = s * (s - side1) * (s - side2) * (s - side3)
                    replacement_values["A"] = area
                    replacement_values["s"] = s
                }
            }
            var rand = Math.floor(Math.random() * 3)
            switch (rand){
                case 0:
                    if(shows1)
                        a1 = side1
                    a2 = side1
                    a3 = side1
                    if(showa1)
                        A1 = angle1
                    A2 = angle1
                    A3 = angle1
                    if(showa2)
                        B1 = angle2
                    B2 = angle2
                    B3 = angle2v2
                    if(shows2)
                        b1 = side2
                    b2 = side2
                    b3 = side2
                    if(shows3)
                        c1 = side3
                    c2 = side3
                    c3 = side3v2
                    if(showa3)
                        C1 = angle3
                    C2 = angle3
                    C3 = angle3v2
                    si1 = "a"
                    si2 = "b"
                    si3 = "c"
                    an1 = "A"
                    an2 = "B"
                    an3 = "C"
                    break
                case 1:
                    if(shows1)
                        b1 = side1
                    b2 = side1
                    b3 = side1
                    if(showa1)
                        B1 = angle1
                    B2 = angle1
                    B3 = angle1
                    if(showa2)
                        C1 = angle2
                    C2 = angle2
                    C3 = angle2v2
                    if(shows2)
                        c1 = side2
                    c2 = side2
                    c3 = side2
                    if(shows3)
                        a1 = side3
                    a2 = side3
                    a3 = side3v2
                    if(showa3)
                        A1 = angle3
                    A2 = angle3
                    A3 = angle3v2
                    si1 = "b"
                    si2 = "c"
                    si3 = "a"
                    an1 = "B"
                    an2 = "C"
                    an3 = "A"
                    break
                case 2:
                    if(shows1)
                        c1 = side1
                    c2 = side1
                    c3 = side1
                    if(showa1)
                        C1 = angle1
                    C2 = angle1
                    C3 = angle1
                    if(showa2)
                        A1 = angle2
                    A2 = angle2
                    A3 = angle2v2
                    if(shows2)
                        a1 = side2
                    a2 = side2
                    a3 = side2
                    if(shows3)
                        b1 = side3
                    b2 = side3
                    b3 = side3v2
                    if(showa3)
                        B1 = angle3
                    B2 = angle3
                    B3 = angle3v2
                    si1 = "c"
                    si2 = "a"
                    si3 = "b"
                    an1 = "C"
                    an2 = "A"
                    an3 = "B"
                    break
            }
            replacement_values["A1"] = A1
            replacement_values["B1"] = B1
            replacement_values["C1"] = C1
            replacement_values["a1"] = a1
            replacement_values["b1"] = b1
            replacement_values["c1"] = c1

            replacement_values["A2"] = A2
            replacement_values["B2"] = B2
            replacement_values["C2"] = C2
            replacement_values["a2"] = a2
            replacement_values["b2"] = b2
            replacement_values["c2"] = c2

            replacement_values["A3"] = A3
            replacement_values["B3"] = B3
            replacement_values["C3"] = C3
            replacement_values["a3"] = a3
            replacement_values["b3"] = b3
            replacement_values["c3"] = c3

            replacement_values["si1"] = si1
            replacement_values["si2"] = si2
            replacement_values["si3"] = si3
            replacement_values["an1"] = an1
            replacement_values["an2"] = an2
            replacement_values["an3"] = an3

            replacement_values["s1v"] = side1
            replacement_values["s2v"] = side2
            replacement_values["s3v"] = side3
            replacement_values["a1v"] = angle1
            replacement_values["a2v"] = angle2
            replacement_values["a3v"] = angle3
            replacement_values["a2v2"] = angle2
            replacement_values["a3v2"] = angle3
            replacement_values["s3v2"] = side3
        }
        else if(problem_type == "Vectors"){
            if(index == 0){
                var x1 = Math.floor(Math.random() * 20 + 1) - 10
                var y1 = Math.floor(Math.random() * 20 + 1) - 10
                var x2 = Math.floor(Math.random() * 20 + 1) - 10
                var y2 = Math.floor(Math.random() * 20 + 1) - 10

                var x3 = x2 - x1
                var y3 = y2 - y1

                replacement_values["x1"] = x1
                replacement_values["y1"] = y1
                replacement_values["x2"] = x2
                replacement_values["y2"] = y2
                replacement_values["x3"] = x3
                replacement_values["y3"] = y3
            }
            else if(index == 1){
                var x1 = Math.floor(Math.random() * 20 + 1) - 10
                var y1 = Math.floor(Math.random() * 20 + 1) - 10
                var x2 = Math.floor(Math.random() * 20 + 1) - 10
                var y2 = Math.floor(Math.random() * 20 + 1) - 10

                var sign = Math.random() > .5 ? "+" : "-"

                var x3 = sign == "+" ? x1 + x2 : x1 - x2
                var y3 = sign == "+" ? y1 + y2 : y1 - y2

                var magnitude = (x3**2+y3**2)**(1/2)
                var theta = Math.atan2(y3, x3) * rad2deg
                if(theta < 0){
                    theta += 360
                }

                replacement_values["x1"] = x1
                replacement_values["y1"] = y1
                replacement_values["x2"] = x2
                replacement_values["y2"] = y2
                replacement_values["x3"] = x3
                replacement_values["y3"] = y3
                replacement_values["sign"] = sign
                replacement_values["magnitude"] = magnitude
                replacement_values["theta"] = theta
            }
            else if(index == 2){
                var px1 = Math.floor(Math.random() * 20 + 1) - 10
                var py1 = Math.floor(Math.random() * 20 + 1) - 10
                var px2 = Math.floor(Math.random() * 20 + 1) - 10
                var py2 = Math.floor(Math.random() * 20 + 1) - 10

                var scal1 = Math.floor(Math.random() * 8 + 2) * (Math.random() > .5 ? 1 : -1)
                var scal2 = Math.floor(Math.random() * 8 + 2)

                var x1 = px1 * scal1
                var y1 = py1 * scal1
                var x2 = px2 * scal2
                var y2 = py2 * scal2

                var sign = Math.random() > .5 ? "+" : "-"

                var x3 = sign == "+" ? x1 + x2 : x1 - x2
                var y3 = sign == "+" ? y1 + y2 : y1 - y2

                var magnitude = (x3**2+y3**2)**(1/2)
                var theta = Math.atan2(y3, x3) * rad2deg
                if(theta < 0){
                    theta += 360
                }

                replacement_values["x1"] = x1
                replacement_values["y1"] = y1
                replacement_values["x2"] = x2
                replacement_values["y2"] = y2
                replacement_values["px1"] = px1
                replacement_values["py1"] = py1
                replacement_values["px2"] = px2
                replacement_values["py2"] = py2
                replacement_values["x3"] = x3
                replacement_values["y3"] = y3
                replacement_values["scal1"] = scal1
                replacement_values["scal2"] = scal2
                replacement_values["sign"] = sign
                replacement_values["magnitude"] = magnitude
                replacement_values["theta"] = theta
            }
            else if(index == 3){
                var x1 = Math.floor(Math.random() * 20 + 1) - 10
                var y1 = Math.floor(Math.random() * 20 + 1) - 10

                var magnitude = (x1**2+y1**2)**(1/2)

                var x2 = x1 / magnitude
                var y2 = y1 / magnitude

                replacement_values["x1"] = x1
                replacement_values["y1"] = y1
                replacement_values["x2"] = x2
                replacement_values["y2"] = y2
                replacement_values["magnitude"] = magnitude
            }
            else if(index == 4){
                var magnitude = Math.floor(Math.random() * 20 + 1)
                var angle = Math.floor(Math.random() * 50 + 21)

                var x1 = magnitude * Math.cos(angle * deg2rad)
                var y1 = magnitude * Math.sin(angle * deg2rad)

                replacement_values["x1"] = x1
                replacement_values["y1"] = y1
                replacement_values["magnitude"] = magnitude
                replacement_values["angle"] = angle
            }
            else if(index == 5){
                var x1 = Math.floor(Math.random() * 20 + 1) - 10
                var y1 = Math.floor(Math.random() * 20 + 1) - 10
                var x2 = Math.floor(Math.random() * 20 + 1) - 10
                var y2 = Math.floor(Math.random() * 20 + 1) - 10

                var dot = (x1 * x2) + (y1 * y2)
                replacement_values["x1"] = x1
                replacement_values["y1"] = y1
                replacement_values["x2"] = x2
                replacement_values["y2"] = y2
                replacement_values["dot"] = dot
            }
        }
        else if(problem_type == "Imaginary"){
            if(index == 0){
                var a = Math.floor(Math.random() * 18 + 3) * (Math.random() > .5 ? 1 : -1)
                var b = Math.floor(Math.random() * 18 + 3) * (Math.random() > .5 ? 1 : -1)

                var r = (a**2+b**2)**(1/2)
                var angle = Math.atan2(b, a) * rad2deg

                if(angle < 0){
                    angle += 360
                }

                var sign = b > 0 ? "+" : ""

                replacement_values["a"] = a
                replacement_values["b"] = b
                replacement_values["r"] = r
                replacement_values["angle"] = angle
                replacement_values["sign"] = sign
            }
            else if(index == 1){
                var r = Math.floor(Math.random() * 18 + 3)
                var angle = Math.floor(Math.random() * 360)

                var a = r * Math.cos(angle * rad2deg)
                var b = r * Math.sin(angle * rad2deg)

                var sign = b > 0 ? "+" : ""

                replacement_values["a"] = a
                replacement_values["b"] = b
                replacement_values["r"] = r
                replacement_values["angle"] = angle
                replacement_values["sign"] = sign
            }
            else if(index == 2){
                var a1 = Math.floor(Math.random() * 8 + 3) * (Math.random() > .5 ? 1 : -1)
                var b1 = Math.floor(Math.random() * 8 + 3) * (Math.random() > .5 ? 1 : -1)
                var a2 = Math.floor(Math.random() * 8 + 3) * (Math.random() > .5 ? 1 : -1)
                var b2 = Math.floor(Math.random() * 8 + 3) * (Math.random() > .5 ? 1 : -1)
                var sign1 = b1 > 0 ? "+" : ""
                var sign2 = b2 > 0 ? "+" : ""

                var f = a1 * a2
                var o = a1 * b2
                var i = b1 * a2
                var l = b1 * b2

                var a3 = f - l
                var b3 = o + i
                var sign3 = b3 >= 0 ? "+" : ""

                replacement_values["a1"] = a1
                replacement_values["b1"] = b1
                replacement_values["sign1"] = sign1
                replacement_values["a2"] = a2
                replacement_values["b2"] = b2
                replacement_values["sign2"] = sign2
                replacement_values["a3"] = a3
                replacement_values["b3"] = b3
                replacement_values["sign3"] = sign3
                replacement_values["f"] = f
                replacement_values["o"] = o
                replacement_values["i"] = i
                replacement_values["l"] = l
            }
            else if(index == 3){
                var r1 = Math.floor(Math.random() * 18 + 3) * (Math.random() > .5 ? 1 : -1)
                var r2 = Math.floor(Math.random() * 18 + 3) * (Math.random() > .5 ? 1 : -1)
                var angle1 = Math.floor(Math.random() * 360)
                var angle2 = Math.floor(Math.random() * 360)

                var r3 = r1 * r2
                var angle3 = angle1 + angle2
                if(angle3 >= 360){
                    angle3 -= 360
                }
                else if(angle3 < 0){
                    angle3 += 360
                }

                replacement_values["r1"] = r1
                replacement_values["r2"] = r2
                replacement_values["r3"] = r3
                replacement_values["angle1"] = angle1
                replacement_values["angle2"] = angle2
                replacement_values["angle3"] = angle3
            }
            else if(index == 4){
                var r1 = Math.floor(Math.random() * 4 + 2) * (Math.random() > .5 ? 1 : -1)
                var angle1 = Math.floor(Math.random() * 360)
                var n = Math.floor(Math.random() * 4 + 2)

                var r2 = r1**n
                var nangle1 = angle1 * n

                var angle2 = nangle1
                while(angle2 >= 360){
                    angle2 -= 360
                }
                while(angle2 < 0){
                    angle2 += 360
                }

                replacement_values["r1"] = r1
                replacement_values["r2"] = r2
                replacement_values["n"] = n
                replacement_values["angle1"] = angle1
                replacement_values["angle2"] = angle2
                replacement_values["nangle1"] = nangle1
            }
        }
    }
    inner = ""
    for(var line of problem.Problem){
        inner += `${line}<br>`
    }
    problem_display.innerHTML = replace_values(inner, replacement_values)

    inner = ""
    for(var line of problem.Answer){
        inner += `${line}<br>`
    }
    problem_answer.innerHTML = replace_values(inner, replacement_values)

    inner = ""
    for(var line of problem.Explanation){
        inner += `${line}<br>`
    }
    problem_explanation.innerHTML = replace_values(inner, replacement_values)

    renderMath()
}
async function renderMath(){
    await MathJax.typesetPromise()
}

async function begin(){
    select_menu("topicselect", "problems")

    elements = document.getElementsByClassName("topic")
    all = false
    problems_json_files = {}
    problem_types_selected = []
    for(el of elements){
        if(el.value == "All" && el.checked){
            all = true
        }
        else if(el.checked || all){
            problem_types_selected.push(el.value)
            problems_json_files[el.value] = await load_json(problem_set, el.value)
        }
    }
    ordered = ordered_select.value == "ordered"
    if(ordered){
        index = -1
        type_index = 0
        problem_type = problem_types_selected[0]
        problems = problems_json_files[problem_type].Types
    }

    generate_problem()
}

function draw_graph(id, xaxis, yaxis, funcs){
    data = []
    for(func of funcs){
        data.push({
            fn: func,
            color: '#0071e3',
            graphType: 'polyline'
        })
    }

    var container = document.querySelector("#graph")

    functionPlot({
        target: "#" + id,
        width: container.clientWidth,
        height: container.clientWidth,
        grid: true,
        xAxis: xaxis,
        yAxis: yaxis,
        data: data
    })
}
function draw_picture(id, xaxis, yaxis, grid, points){
    var container = document.querySelector("#" + id)

    functionPlot({
        target: "#" + id,
        width: container.clientWidth,
        height: container.clientHeight,
        grid: grid,
        xAxis:xaxis,
        yAxis:yaxis,
        data: [
            {
                points: points,
                fnType: 'points',
                color: '#0071e3',
                graphType: 'polyline'
            }
        ]
    })
}
function draw_segmented(id, xaxis, yaxis, grid, segments){
    var container = document.querySelector("#" + id)

    data = []
    for(segment of segments){
        data.push({
            points: segment,
            fnType: 'points',
            color: '#0071e3',
            graphType: 'polyline'
        })
    }

    functionPlot({
        target: "#" + id,
        width: container.clientWidth,
        height: container.clientHeight,
        grid: grid,
        xAxis:xaxis,
        yAxis:yaxis,
        data: data
    })
}
function draw_vectors(id, xaxis, yaxis, vectors){
    var container = document.querySelector("#" + id)

    var data = []
    vectors.forEach(vector => {
        data.push({
            vector: [vector[2], vector[3]],
            offset: [vector[0], vector[1]],
            graphType: 'polyline',
            fnType: 'vector'
        })
    })

    functionPlot({
        target: "#" + id,
        width: container.clientWidth,
        height: container.clientHeight,
        grid: false,
        xAxis:xaxis,
        yAxis:yaxis,
        data: data
    })
}
function draw_triangle(id, A, B, C, a, b, c){
    var container = document.querySelector("#" + id)

    var corner_color = "#000000"
    var angle_color = "#11008e"
    var side_color = "#880000"

    functionPlot({
        target: "#" + id,
        width: container.clientWidth,
        height: container.clientHeight,
        grid: false,
        xAxis:{domain: [-1, 4]},
        yAxis:{domain: [-1, 4]},
        data: [
            {
                points: [[0, 0], [3, 0], [1.5, 3], [0, 0]],
                fnType: 'points',
                graphType: 'polyline'
            },
            {
                graphType: 'text',
                location: [-.1, -.1],
                color: corner_color,
                text: 'A'
            },
            {
                graphType: 'text',
                location: [3.1, -.1],
                color: corner_color,
                text: 'B'
            },
            {
                graphType: 'text',
                location: [1.5, 3.1],
                color: corner_color,
                text: 'C'
            },
            {
                graphType: 'text',
                location: [.15, .1],
                color: angle_color,
                text: A
            },
            {
                graphType: 'text',
                location: [2.6, .1],
                color: angle_color,
                text: B
            },
            {
                graphType: 'text',
                location: [1.4, 2.6],
                color: angle_color,
                text: C
            },
            {
                graphType: 'text',
                location: [2.3, 1.6],
                color: side_color,
                text: a
            },
            {
                graphType: 'text',
                location: [.6, 1.6],
                color: side_color,
                text: b
            },
            {
                graphType: 'text',
                location: [1.4, -.2],
                color: side_color,
                text: c
            }
        ]
    })
}
function reset(){
    problem_answer.innerHTML = ""
    problem_explanation.innerHTML = ""
    problem_display.innerHTML = ""

    document.getElementById("problems").hidden = true
    document.getElementById("answer_div").hidden = true
    problem_explanation.hidden = true

    // Object.entries(problem_sets).forEach(set => {
    //     Object.entries(set[1]).forEach(category => {
    //         if(category[0] != "rounding"){
    //             document.getElementById(set[0] + category[0]).hidden = true
    //         }
    //     })
    //     document.getElementById(set[0]).hidden = true
    // })
    document.getElementById("topicselect").hidden = true
}
async function load_json(subject, problem_set) {
    const problems_file = await fetch(`./Random/${subject}/${problem_set}.json`)
    return await problems_file.json()
}
function replace_values(input, value_dict){
    Object.entries(value_dict).forEach(value => {
        if(typeof(value[1]) == "number"){
            value[1] = Math.round(value[1] * 10**cur_rounding) / 10**cur_rounding
        }
        input = input.replaceAll(`%${value[0]}%`, value[1].toString())
    })
    return input
}