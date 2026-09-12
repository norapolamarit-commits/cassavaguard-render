(()=>{window.CG={API:""};(function(){let i="cg_token";function e(){return localStorage.getItem(i)||""}function t(a){a?localStorage.setItem(i,a):localStorage.removeItem(i)}async function n(a,{method:r="GET",body:o,form:l,auth:c=!0,raw:f=!1}={}){let p={};c&&e()&&(p.Authorization="Bearer "+e());let u;l?u=l:o!==void 0&&(p["Content-Type"]="application/json",u=JSON.stringify(o));let d=await fetch(window.CG.API+a,{method:r,headers:p,body:u});if(f)return c&&d.status===401&&(t(""),window.dispatchEvent(new Event("cg:unauthorized"))),d;let M=(d.headers.get("content-type")||"").includes("application/json")?await d.json():await d.text();if(!d.ok){c&&d.status===401&&(t(""),window.dispatchEvent(new Event("cg:unauthorized")));let m=M&&M.detail?M.detail:typeof M=="string"?M:"Request failed",h=new Error(m);throw h.status=d.status,h.data=M,h}return M}let s={getToken:e,setToken:t,get:a=>n(a),post:(a,r)=>n(a,{method:"POST",body:r}),patch:(a,r)=>n(a,{method:"PATCH",body:r}),delete:a=>n(a,{method:"DELETE"}),postForm:(a,r)=>n(a,{method:"POST",form:r}),raw:(a,r)=>n(a,{...r,raw:!0}),health:()=>n("/api/health",{auth:!1}),login:(a,r)=>n("/api/auth/login-json",{method:"POST",body:{email:a,password:r},auth:!1}),register:a=>n("/api/auth/register",{method:"POST",body:a,auth:!1}),forgot:a=>n("/api/auth/forgot",{method:"POST",body:{email:a},auth:!1}),reset:(a,r)=>n("/api/auth/reset",{method:"POST",body:{token:a,new_password:r},auth:!1}),me:()=>n("/api/auth/me"),updateMe:a=>n("/api/auth/me",{method:"PATCH",body:a}),adminUsers:()=>n("/api/admin/users"),updateUserRole:(a,r)=>n(`/api/admin/users/${a}/role`,{method:"PATCH",body:{role:r}}),kpis:()=>n("/api/dashboard/kpis"),riskDist:()=>n("/api/dashboard/risk-distribution"),healthByField:()=>n("/api/dashboard/health-by-field"),fields:()=>n("/api/fields"),fieldsGeo:()=>n("/api/fields/geojson"),field:a=>n("/api/fields/"+a),createField:a=>n("/api/fields",{method:"POST",body:a}),chat:(a,r="th")=>n("/api/chat",{method:"POST",body:{message:a,language:r}}),predictImage:(a,r,o)=>{let l=new FormData;return l.append("file",a),l.append("source",r),o&&l.append("field_id",o),n("/api/predict/image",{method:"POST",form:l})},predictImages:(a,r)=>{let o=new FormData;return a.forEach(l=>{o.append("files",l.file),o.append("sources",l.source)}),r&&o.append("field_id",r),n("/api/predict/images",{method:"POST",form:o})},predictCsv:(a,r)=>{let o=new FormData;return o.append("file",a),r&&o.append("field_id",r),n("/api/predict/csv",{method:"POST",form:o})},classes:()=>n("/api/predict/classes"),predictionContext:a=>n(`/api/predict/context/${a}`),yieldEstimate:a=>n("/api/predict/yield-estimate",{method:"POST",body:a}),rootWeight:a=>n("/api/predict/root-weight",{method:"POST",body:a}),rootSize:(a,r="side")=>{let o=new FormData;return o.append("file",a),o.append("view",r),n("/api/predict/root-size",{method:"POST",form:o})},saveRootImageSet:a=>{let r=new FormData;return a.forEach(o=>r.append("files",o)),n("/api/predict/root-image-sets",{method:"POST",form:r})},saveRootVideoSet:a=>{let r=new FormData;return r.append("file",a),n("/api/predict/root-video-sets",{method:"POST",form:r})},startRootReconstruction:a=>n("/api/predict/reconstruction",{method:"POST",body:a}),rootReconstructionStatus:a=>n(`/api/predict/reconstruction/${a}`),saveHarvestMeasurement:a=>n("/api/predict/harvest-measurements",{method:"POST",body:a}),satMeta:()=>n("/api/satellite/meta"),satTimeline:(a,r=12)=>n(`/api/satellite/${a}/timeline?months=${r}`),satGrid:(a,r,o)=>n(`/api/satellite/${a}/grid?index=${r}`+(o?`&date=${o}`:"")),satPasses:a=>n(`/api/satellite/${a}/passes`),satCompare:(a,r,o,l)=>n(`/api/satellite/${a}/compare?index=${encodeURIComponent(r)}`+(o?`&date_a=${encodeURIComponent(o)}`:"")+(l?`&date_b=${encodeURIComponent(l)}`:"")),weatherCurrent:a=>n("/api/weather/current"+(a?`?field_id=${a}`:"")),weatherHistory:(a,r=30)=>n(`/api/weather/history?days=${r}`+(a?`&field_id=${a}`:"")),weatherForecast:(a,r=7)=>n(`/api/weather/forecast?days=${r}`+(a?`&field_id=${a}`:"")),weatherSummary:a=>n("/api/weather/summary"+(a?`?field_id=${a}`:"")),soil:a=>n("/api/soil/"+a),soilMoisture:(a,r=30)=>n(`/api/soil/${a}/moisture?days=${r}`),soilAll:()=>n("/api/soil"),soilSamples:a=>n(`/api/soil/${a}/samples`),createSoilSample:(a,r)=>n(`/api/soil/${a}/samples`,{method:"POST",body:r}),notifications:a=>n("/api/notifications"+(a?"?unread_only=true":"")),markRead:a=>n(`/api/notifications/${a}/read`,{method:"POST"}),markAllRead:()=>n("/api/notifications/read-all",{method:"POST"}),history:(a={})=>{let r=new URLSearchParams(a).toString();return n("/api/history/predictions"+(r?"?"+r:""))},historyDetail:a=>n("/api/history/predictions/"+a),deletePrediction:a=>n("/api/history/predictions/"+a,{method:"DELETE"}),exportCsv:()=>n("/api/history/predictions/export.csv",{raw:!0}),models:()=>n("/api/models"),modelCompare:()=>n("/api/models/compare"),systemStatus:()=>n("/api/models/system"),logs:()=>n("/api/logs")};window.CG.API_CLIENT=s})();(function(){let i={app_name:{th:"CassavaGuard AI",en:"CassavaGuard AI"},app_tag:{th:"\u0E41\u0E1E\u0E25\u0E15\u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E40\u0E01\u0E29\u0E15\u0E23\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33\u0E14\u0E49\u0E27\u0E22 AI",en:"AI Precision Agriculture"},nav_dashboard:{th:"\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14",en:"Dashboard"},nav_map:{th:"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07",en:"Field Map"},nav_predict:{th:"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI",en:"AI Diagnosis"},nav_satellite:{th:"\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite"},nav_weather:{th:"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28",en:"Weather"},nav_soil:{th:"\u0E14\u0E34\u0E19",en:"Soil"},nav_reco:{th:"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",en:"Recommendations"},nav_history:{th:"\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34",en:"History"},nav_system:{th:"\u0E23\u0E30\u0E1A\u0E1A & \u0E42\u0E21\u0E40\u0E14\u0E25",en:"System & Models"},nav_guide:{th:"\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",en:"User Guide"},nav_legal:{th:"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27 & \u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D",en:"Privacy & Contact"},nav_welcome:{th:"\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19",en:"Welcome"},nav_more:{th:"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21",en:"More"},loading:{th:"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14\u2026",en:"Loading\u2026"},healthy:{th:"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E14\u0E35",en:"Healthy"},high_risk:{th:"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07",en:"High Risk"},medium:{th:"\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",en:"Medium"},low:{th:"\u0E15\u0E48\u0E33",en:"Low"},high:{th:"\u0E2A\u0E39\u0E07",en:"High"},optimal:{th:"\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E2A\u0E21",en:"Optimal"},warning:{th:"\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07",en:"Warning"},critical:{th:"\u0E27\u0E34\u0E01\u0E24\u0E15",en:"Critical"},confidence:{th:"\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08",en:"Confidence"},evidence:{th:"\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19",en:"Evidence"},recommendation:{th:"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",en:"Recommendation"},view:{th:"\u0E14\u0E39",en:"View"},close:{th:"\u0E1B\u0E34\u0E14",en:"Close"},all_fields:{th:"\u0E17\u0E38\u0E01\u0E41\u0E1B\u0E25\u0E07",en:"All fields"},select_field:{th:"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07",en:"Select field"},logout:{th:"\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",en:"Log out"},search:{th:"\u0E04\u0E49\u0E19\u0E2B\u0E32",en:"Search"},export_csv:{th:"\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 CSV",en:"Export CSV"},export_pdf:{th:"\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 PDF",en:"Export PDF"},no_data:{th:"\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",en:"No data"},rai:{th:"\u0E44\u0E23\u0E48",en:"rai"},days:{th:"\u0E27\u0E31\u0E19",en:"days"},age:{th:"\u0E2D\u0E32\u0E22\u0E38",en:"Age"},variety:{th:"\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C",en:"Variety"},dash_title:{th:"\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E23\u0E30\u0E1A\u0E1A",en:"Operations Overview"},dash_sub:{th:"\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E23\u0E27\u0E21\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07",en:"Integrated cassava monitoring center"},kpi_fields:{th:"\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21",en:"Monitored Fields"},kpi_plants:{th:"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2F",en:"Cassava Plants"},kpi_healthy:{th:"\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E14\u0E35",en:"Healthy Rate"},kpi_risk:{th:"\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07",en:"High-Risk Rate"},kpi_disease:{th:"\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E42\u0E23\u0E04",en:"Disease Alerts"},kpi_nutrient:{th:"\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E18\u0E32\u0E15\u0E38\u0E2D\u0E32\u0E2B\u0E32\u0E23",en:"Nutrient Alerts"},kpi_water:{th:"\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E19\u0E49\u0E33",en:"Water Alerts"},kpi_health:{th:"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22",en:"Avg Health"},weather_now:{th:"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19",en:"Weather Now"},sat_status:{th:"\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite Status"},risk_dist:{th:"\u0E01\u0E32\u0E23\u0E01\u0E23\u0E30\u0E08\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07",en:"Risk Distribution"},field_health:{th:"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E23\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07",en:"Health by Field"},online:{th:"\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C",en:"online"},predict_title:{th:"\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E1E\u0E37\u0E0A\u0E14\u0E49\u0E27\u0E22 AI",en:"AI Crop Diagnosis"},predict_sub:{th:"\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E\u0E43\u0E1A / \u0E15\u0E49\u0E19 / \u0E17\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E21 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E1F\u0E25\u0E4C CSV \u0E40\u0E0B\u0E19\u0E40\u0E0B\u0E2D\u0E23\u0E4C",en:"Upload leaf / plant / canopy image or sensor CSV"},drop_here:{th:"\u0E25\u0E32\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E21\u0E32\u0E27\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01",en:"Drop file here or click to browse"},analyze:{th:"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",en:"Analyze"},analyzing:{th:"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22\u0E42\u0E21\u0E40\u0E14\u0E25\u2026",en:"Running inference\u2026"},top3:{th:"3 \u0E2D\u0E31\u0E19\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19",en:"Top 3 Predictions"},symptoms:{th:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A",en:"Detected Symptoms"},attention:{th:"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E08\u0E38\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D (Attribution Map)",en:"AI Attribution Map"},explain:{th:"\u0E04\u0E33\u0E2D\u0E18\u0E34\u0E1A\u0E32\u0E22\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",en:"AI Explanation"},feat_imp:{th:"\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E02\u0E2D\u0E07\u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22",en:"Feature Importance"},prob_dist:{th:"\u0E01\u0E32\u0E23\u0E01\u0E23\u0E30\u0E08\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19",en:"Probability Distribution"},src_leaf:{th:"\u0E43\u0E1A",en:"Leaf"},src_plant:{th:"\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19",en:"Plant"},src_canopy:{th:"\u0E17\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E21",en:"Canopy"},src_csv:{th:"CSV",en:"CSV"},take_photo:{th:"\u0E16\u0E48\u0E32\u0E22\u0E23\u0E39\u0E1B",en:"Take Photo"},upload_file:{th:"\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C",en:"Upload File"},capture:{th:"\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E",en:"Capture"},retake:{th:"\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48",en:"Retake"},use_photo:{th:"\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E19\u0E35\u0E49",en:"Use Photo"},switch_cam:{th:"\u0E2A\u0E25\u0E31\u0E1A\u0E01\u0E25\u0E49\u0E2D\u0E07",en:"Flip Camera"},cam_error:{th:"\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E01\u0E25\u0E49\u0E2D\u0E07\u0E44\u0E14\u0E49 \u2014 \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",en:"Cannot access camera \u2014 check permissions"},cam_starting:{th:"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E1B\u0E34\u0E14\u0E01\u0E25\u0E49\u0E2D\u0E07\u2026",en:"Starting camera\u2026"},login:{th:"\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A",en:"Log in"},register:{th:"\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01",en:"Register"},email:{th:"\u0E2D\u0E35\u0E40\u0E21\u0E25",en:"Email"},password:{th:"\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19",en:"Password"},full_name:{th:"\u0E0A\u0E37\u0E48\u0E2D-\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25",en:"Full name"},role:{th:"\u0E1A\u0E17\u0E1A\u0E32\u0E17",en:"Role"},forgot_pw:{th:"\u0E25\u0E37\u0E21\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19?",en:"Forgot password?"},have_account:{th:"\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27?",en:"Already have an account?"},no_account:{th:"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35?",en:"Don't have an account?"},admin:{th:"\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A",en:"Admin"},researcher:{th:"\u0E19\u0E31\u0E01\u0E27\u0E34\u0E08\u0E31\u0E22",en:"Researcher"},farmer:{th:"\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23",en:"Farmer"},demo_accounts:{th:"\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E17\u0E14\u0E25\u0E2D\u0E07",en:"Demo accounts"},notifications:{th:"\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19",en:"Notifications"},mark_all_read:{th:"\u0E2D\u0E48\u0E32\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",en:"Mark all read"},veg_indices:{th:"\u0E14\u0E31\u0E0A\u0E19\u0E35\u0E1E\u0E37\u0E0A\u0E1E\u0E23\u0E23\u0E13",en:"Vegetation Indices"},time_slider:{th:"\u0E44\u0E17\u0E21\u0E4C\u0E2A\u0E44\u0E25\u0E40\u0E14\u0E2D\u0E23\u0E4C",en:"Time Slider"},risk_zones:{th:"\u0E42\u0E0B\u0E19\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07",en:"Risk Zones"},sat_timeline:{th:"\u0E44\u0E17\u0E21\u0E4C\u0E44\u0E25\u0E19\u0E4C\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite Pass Timeline"},compare:{th:"\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32",en:"Historical Comparison"},forecast:{th:"\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E13\u0E4C 7 \u0E27\u0E31\u0E19",en:"7-Day Forecast"},trend:{th:"\u0E41\u0E19\u0E27\u0E42\u0E19\u0E49\u0E21\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07",en:"Historical Trend"},soil_profile:{th:"\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C\u0E14\u0E34\u0E19",en:"Soil Profile"},moisture:{th:"\u0E04\u0E27\u0E32\u0E21\u0E0A\u0E37\u0E49\u0E19\u0E14\u0E34\u0E19",en:"Soil Moisture"},model_perf:{th:"\u0E2A\u0E21\u0E23\u0E23\u0E16\u0E19\u0E30\u0E42\u0E21\u0E40\u0E14\u0E25",en:"Model Performance"},model_cmp:{th:"\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E42\u0E21\u0E40\u0E14\u0E25",en:"Model Comparison"},server_status:{th:"\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C",en:"Server Status"},training_logs:{th:"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E23\u0E30\u0E1A\u0E1A",en:"System Logs"}};function e(t){return n=>i[n]?i[n][t]||i[n].en:n}window.CG.DICT=i,window.CG.makeT=e})();(function(){let{createContext:i,useContext:e,useState:t,useEffect:n,useCallback:s,useRef:a}=React,r=i(null);function o({children:l}){let[c,f]=t(()=>localStorage.getItem("cg_theme")||"dark"),[p,u]=t(()=>localStorage.getItem("cg_lang")||"en"),[d,x]=t(null),[M,m]=t(!1),[h,S]=t([]),E=a(1);n(()=>{let v=document.documentElement;v.classList.toggle("dark",c==="dark"),v.classList.toggle("light",c==="light"),localStorage.setItem("cg_theme",c)},[c]),n(()=>{localStorage.setItem("cg_lang",p),document.documentElement.lang=p},[p]),n(()=>{let v=window.CG.API_CLIENT;v.setToken(""),v.me().then(x).finally(()=>m(!0))},[]);let y=s((v,T="info",C=4200)=>{let N=E.current++;S(L=>[...L,{id:N,msg:v,kind:T}]),setTimeout(()=>S(L=>L.filter(O=>O.id!==N)),C)},[]),g=s(v=>S(T=>T.filter(C=>C.id!==v)),[]),_=window.CG.makeT(p),R={theme:c,setTheme:f,toggleTheme:()=>f(v=>v==="dark"?"light":"dark"),lang:p,setLang:u,toggleLang:()=>u(v=>v==="th"?"en":"th"),user:d,setUser:x,booted:M,toast:y,toasts:h,dismissToast:g,t:_};return React.createElement(r.Provider,{value:R},l)}window.CG.Store={Provider:o,useStore:()=>e(r)}})();(function(){let{useState:i,useEffect:e,useRef:t}=React,n=({name:h,className:S="w-5 h-5",...E})=>{let y={grid:"M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2zM9 3v16M15 5v16",brain:"M12 5a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 0 3 3 0 0 0 2-4 3 3 0 0 0-1-5 3 3 0 0 0-3-3zM12 5v14",satellite:"M5 13l-2 2 4 4 2-2M13 5l2-2 4 4-2 2M9 9l6 6M7 11l-4 4 2 2 4-4M17 13l4-4-2-2-4 4",cloud:"M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 17 18H7z",soil:"M3 7h18M3 12h18M3 17h18M6 7v10M12 7v10M18 7v10",bulb:"M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",history:"M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 8v4l3 2",book:"M4 5a3 3 0 0 1 3-2h5v18H7a3 3 0 0 0-3 2V5zM20 5a3 3 0 0 0-3-2h-5v18h5a3 3 0 0 1 3 2V5z",cpu:"M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M6 6h12v12H6zM10 10h4v4h-4z",bell:"M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0",sun:"M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",moon:"M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z",globe:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 4 5.6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.6-4-9s1.5-6.5 4-9z",logout:"M15 12H3M11 8l-4 4 4 4M9 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9",upload:"M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",download:"M12 4v12M8 12l4 4 4-4M4 18v2h16v-2",search:"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3",close:"M6 6l12 12M18 6 6 18",check:"M5 13l4 4L19 7",alert:"M12 3 2 20h20L12 3zM12 9v5M12 17v.5",drop:"M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z",leaf:"M4 20s0-8 6-12 10-4 10-4 0 8-6 12S4 20 4 20zM10 14s2-4 6-6",chevron:"M9 6l6 6-6 6",temp:"M12 3a2 2 0 0 0-2 2v9a4 4 0 1 0 4 0V5a2 2 0 0 0-2-2z",wind:"M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9",plus:"M12 5v14M5 12h14",menu:"M4 7h16M4 12h16M4 17h16",play:"M8 5v14l11-7L8 5z",activity:"M3 12h4l2-7 4 14 2-7h6",privacy:"M12 3 4 6v5c0 5.2 3.4 8.6 8 10 4.6-1.4 8-4.8 8-10V6l-8-3zM9 12l2 2 4-4",camera:"M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"};return React.createElement("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",className:S,...E},React.createElement("path",{d:y[h]||y.grid}))},s=({className:h="",children:S,hover:E=!1,pad:y="p-5",...g})=>React.createElement("section",{className:`glass cg-card ${y} ${E?"card-hover":""} ${h}`,...g},S),a=({icon:h,title:S,sub:E,right:y})=>React.createElement("div",{className:"cg-section-title flex items-center justify-between mb-5 gap-3"},React.createElement("div",{className:"flex items-center gap-3 min-w-0"},h&&React.createElement("div",{className:"cg-section-icon"},React.createElement(n,{name:h})),React.createElement("div",{className:"min-w-0"},React.createElement("h3",{className:"txt font-bold text-base leading-tight"},S),E&&React.createElement("p",{className:"txt-soft text-sm mt-1 leading-snug"},E))),y);function r(h,S=900){let[E,y]=i(0),g=t();return e(()=>{let _=performance.now(),R=0,v=T=>{let C=Math.min(1,(T-_)/S),N=1-Math.pow(1-C,3);y(R+(h-R)*N),C<1&&(g.current=requestAnimationFrame(v))};return g.current=requestAnimationFrame(v),()=>cancelAnimationFrame(g.current)},[h]),E}let o=({icon:h,label:S,value:E,suffix:y="",decimals:g=0,tone:_="brand",spark:R,delta:v,delay:T=0})=>{let C=r(Number(E)||0),N={brand:"from-brand-500/20 to-cyan2/10 text-brand-300",cyan:"from-cyan2/20 to-brand-500/10 text-cyan2-light",amber:"from-amber-500/20 to-orange-500/10 text-amber-300",rose:"from-rose-500/20 to-red-500/10 text-rose-300",violet:"from-violet-500/20 to-fuchsia-500/10 text-violet-300"},L=O=>g?O.toLocaleString(void 0,{minimumFractionDigits:g,maximumFractionDigits:g}):Math.round(O).toLocaleString();return React.createElement(s,{hover:!0,className:"animate-fadeup relative overflow-hidden",style:{animationDelay:T+"ms"}},React.createElement("div",{className:`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${N[_]} blur-2xl opacity-60`}),React.createElement("div",{className:"flex items-start justify-between relative"},React.createElement("div",{className:`w-11 h-11 rounded-xl bg-gradient-to-br ${N[_]} grid place-items-center`},React.createElement(n,{name:h,className:"w-5 h-5"})),v!=null&&React.createElement("span",{className:`text-xs font-semibold px-2 py-0.5 rounded-full ${v>=0?"text-brand-300 bg-brand-500/10":"text-rose-300 bg-rose-500/10"}`},v>=0?"\u25B2":"\u25BC"," ",Math.abs(v),"%")),React.createElement("div",{className:"mt-4 relative"},React.createElement("div",{className:"txt text-3xl font-bold tracking-tight tabular-nums"},L(C),React.createElement("span",{className:"text-lg txt-soft font-semibold"},y)),React.createElement("div",{className:"txt-soft text-xs mt-1 font-medium"},S)),R)},l=({tone:h="brand",children:S,dot:E=!1,className:y=""})=>{let g={brand:"text-brand-300 bg-brand-500/12 border-brand-500/25",low:"text-brand-300 bg-brand-500/12 border-brand-500/25",optimal:"text-brand-300 bg-brand-500/12 border-brand-500/25",online:"text-brand-300 bg-brand-500/12 border-brand-500/25",medium:"text-amber-300 bg-amber-500/12 border-amber-500/25",warning:"text-amber-300 bg-amber-500/12 border-amber-500/25",high:"text-rose-300 bg-rose-500/12 border-rose-500/25",critical:"text-rose-300 bg-rose-500/12 border-rose-500/25",info:"text-cyan2-light bg-cyan2/12 border-cyan2/25",slate:"txt-soft bg-slate-500/10 border-slate-500/20",healthy:"text-brand-300 bg-brand-500/12 border-brand-500/25",cmd:"text-red-300 bg-red-500/12 border-red-500/25",cbsd:"text-orange-300 bg-orange-500/12 border-orange-500/25",cbb:"text-amber-300 bg-amber-500/12 border-amber-500/25",cgm:"text-violet-300 bg-violet-500/12 border-violet-500/25",cad:"text-teal-300 bg-teal-500/12 border-teal-500/25",brown_leaf_spot:"text-yellow-300 bg-yellow-500/12 border-yellow-500/25",white_leaf_spot:"text-lime-300 bg-lime-500/12 border-lime-500/25",sed:"text-cyan-300 bg-cyan-500/12 border-cyan-500/25",mealybug:"text-fuchsia-300 bg-fuchsia-500/12 border-fuchsia-500/25",whitefly:"text-pink-300 bg-pink-500/12 border-pink-500/25",water_stress:"text-sky-300 bg-sky-500/12 border-sky-500/25",nutrient_def:"text-indigo-300 bg-indigo-500/12 border-indigo-500/25"};return React.createElement("span",{className:`cg-badge inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${g[h]||g.slate} ${y}`},E&&React.createElement("span",{className:"w-1.5 h-1.5 rounded-full bg-current animate-pulse"}),S)},c=({value:h=0,size:S=92,stroke:E=8,label:y,sub:g,tone:_})=>{let R=(S-E)/2,v=2*Math.PI*R,T=Math.max(0,Math.min(100,h)),C=_||(T>=78?"#10b981":T>=60?"#f59e0b":"#f43f5e"),[N,L]=i(v);return e(()=>{let O=setTimeout(()=>L(v-T/100*v),60);return()=>clearTimeout(O)},[T,v]),React.createElement("div",{className:"relative grid place-items-center",style:{width:S,height:S}},React.createElement("svg",{width:S,height:S,className:"-rotate-90"},React.createElement("circle",{cx:S/2,cy:S/2,r:R,strokeWidth:E,className:"hair",stroke:"currentColor",fill:"none",opacity:"0.25"}),React.createElement("circle",{cx:S/2,cy:S/2,r:R,strokeWidth:E,stroke:C,fill:"none",strokeLinecap:"round",strokeDasharray:v,strokeDashoffset:N,style:{transition:"stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)"}})),React.createElement("div",{className:"absolute text-center"},React.createElement("div",{className:"txt font-bold text-lg tabular-nums"},Math.round(T),React.createElement("span",{className:"text-xs"},g||"%")),y&&React.createElement("div",{className:"txt-dim text-[10px] mt-0.5"},y)))},f=({className:h="h-4 w-full",rounded:S="rounded-lg"})=>React.createElement("div",{className:`skeleton ${S} ${h}`}),p=({h="h-28"})=>React.createElement(s,null,React.createElement("div",{className:"space-y-3"},React.createElement(f,{className:"h-9 w-9",rounded:"rounded-xl"}),React.createElement(f,{className:`${h} w-full`}),React.createElement(f,{className:"h-3 w-2/3"}))),u=()=>{let{toasts:h,dismissToast:S}=window.CG.Store.useStore(),E={info:"info",success:"low",error:"high",warn:"medium"},y={info:"bell",success:"check",error:"alert",warn:"alert"};return React.createElement("div",{className:"fixed z-[9999] bottom-5 right-5 flex flex-col gap-2 w-[min(92vw,360px)]"},h.map(g=>React.createElement("div",{key:g.id,className:"glass-strong rounded-xl p-3.5 flex items-start gap-3 animate-slidein shadow-xl"},React.createElement("div",{className:`shrink-0 mt-0.5 ${g.kind==="error"?"text-rose-400":g.kind==="success"?"text-brand-400":g.kind==="warn"?"text-amber-400":"text-cyan2-light"}`},React.createElement(n,{name:y[g.kind]||"bell",className:"w-4 h-4"})),React.createElement("div",{className:"txt text-sm flex-1 leading-snug"},g.msg),React.createElement("button",{onClick:()=>S(g.id),className:"txt-dim hover:txt"},React.createElement(n,{name:"close",className:"w-4 h-4"})))))},d=({open:h,onClose:S,title:E,children:y,wide:g=!1})=>(e(()=>{if(!h)return;let _=R=>R.key==="Escape"&&S();return window.addEventListener("keydown",_),()=>window.removeEventListener("keydown",_)},[h,S]),h?React.createElement("div",{className:"fixed inset-0 z-[9000] grid place-items-center p-4 animate-fadein",onMouseDown:S},React.createElement("div",{className:"absolute inset-0 bg-black/55 backdrop-blur-sm"}),React.createElement("div",{onMouseDown:_=>_.stopPropagation(),className:`glass-strong cg-modal relative w-full ${g?"max-w-4xl":"max-w-lg"} max-h-[88vh] overflow-y-auto no-scrollbar animate-fadeup shadow-2xl`},React.createElement("div",{className:"flex items-center justify-between p-5 border-b hair sticky top-0 glass-strong z-10"},React.createElement("h3",{className:"txt font-bold text-lg"},E),React.createElement("button",{onClick:S,className:"txt-dim hover:txt w-8 h-8 grid place-items-center rounded-lg hover:bg-white/5"},React.createElement(n,{name:"close"}))),React.createElement("div",{className:"p-5"},y))):null),x=({options:h,value:S,onChange:E,size:y="text-xs"})=>React.createElement("div",{className:"cg-segmented inline-flex p-1 glass gap-1"},h.map(g=>React.createElement("button",{key:g.value,onClick:()=>E(g.value),className:`px-3 py-2 rounded-xl font-semibold transition ${y} ${S===g.value?"grad-brand text-white shadow":"txt-soft hover:txt"}`},g.label))),M=({className:h="w-5 h-5"})=>React.createElement("svg",{className:`animate-spin ${h}`,viewBox:"0 0 24 24",fill:"none"},React.createElement("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"3",opacity:"0.2"}),React.createElement("path",{d:"M12 2a10 10 0 0 1 10 10",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round"})),m=({icon:h="grid",text:S})=>React.createElement("div",{className:"flex flex-col items-center justify-center py-12 txt-dim gap-2"},React.createElement(n,{name:h,className:"w-9 h-9 opacity-50"}),React.createElement("p",{className:"text-sm"},S));window.CG.UI={Icon:n,Card:s,SectionTitle:a,KPICard:o,Badge:l,ProgressRing:c,Skeleton:f,SkelCard:p,ToastHost:u,Modal:d,Segmented:x,Spinner:M,Empty:m,useCountUp:r}})();(function(){let{useRef:i,useEffect:e}=React;function t(){let d=document.documentElement.classList.contains("light");return{grid:d?"rgba(15,23,42,.08)":"rgba(148,163,184,.12)",tick:d?"#5b6b82":"#93a4bd",brand:"#10b981",cyan:"#06b6d4",amber:"#f59e0b",rose:"#f43f5e",violet:"#8b5cf6",blue:"#3b82f6"}}let n={healthy:"#10b981",cmd:"#ef4444",cbsd:"#f97316",cbb:"#f59e0b",cgm:"#8b5cf6",cad:"#14b8a6",brown_leaf_spot:"#eab308",white_leaf_spot:"#84cc16",sed:"#06b6d4",mealybug:"#d946ef",whitefly:"#ec4899",water_stress:"#0ea5e9",nutrient_def:"#6366f1"};function s(d={}){let x=t();return{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:"index"},plugins:{legend:{display:!1,labels:{color:x.tick,boxWidth:10,usePointStyle:!0}},tooltip:{backgroundColor:"rgba(9,14,26,.94)",borderColor:"rgba(148,163,184,.2)",borderWidth:1,titleColor:"#e5edf7",bodyColor:"#cbd5e1",padding:10,cornerRadius:10,displayColors:!0,boxPadding:4}},scales:{x:{grid:{color:x.grid,drawBorder:!1},ticks:{color:x.tick,font:{size:10},maxRotation:0,autoSkip:!0,maxTicksLimit:8}},y:{grid:{color:x.grid,drawBorder:!1},ticks:{color:x.tick,font:{size:10}}}},...d}}function a({type:d,data:x,options:M,height:m=240,plugins:h}){let S=i(null),E=i(null);return e(()=>{if(!S.current)return;let y=S.current.getContext("2d");return E.current=new window.Chart(y,{type:d,data:x,options:M,plugins:h}),()=>E.current&&E.current.destroy()},[JSON.stringify(x),JSON.stringify(M),d]),React.createElement("div",{style:{height:m}},React.createElement("canvas",{ref:S}))}function r(d,x,M,m){if(!x)return M;let h=d.createLinearGradient(0,x.top,0,x.bottom);return h.addColorStop(0,M),h.addColorStop(1,m),h}let o=({labels:d,series:x,height:M=240,fill:m=!0,opts:h={}})=>{let S=t(),E=[S.brand,S.cyan,S.amber,S.violet,S.rose],y={labels:d,datasets:x.map((g,_)=>({label:g.label,data:g.data,borderColor:g.color||E[_%E.length],borderWidth:2,tension:.38,pointRadius:0,pointHoverRadius:4,fill:m&&x.length===1,backgroundColor:R=>r(R.chart.ctx,R.chart.chartArea,(g.color||E[_%E.length])+"44",(g.color||E[_%E.length])+"02")}))};return React.createElement(a,{type:"line",data:y,height:M,options:s({plugins:{legend:{display:x.length>1,labels:{color:S.tick,boxWidth:10,usePointStyle:!0}}},...h})})},l=({labels:d,series:x,height:M=240,horizontal:m=!1,stacked:h=!1,opts:S={}})=>{let E=t(),y=[E.brand,E.cyan,E.amber,E.violet,E.rose,E.blue],g={labels:d,datasets:x.map((R,v)=>({label:R.label,data:R.data,backgroundColor:R.colors||(R.color||y[v%y.length])+"cc",borderRadius:7,borderSkipped:!1,barPercentage:.72,categoryPercentage:.78}))},_=s({indexAxis:m?"y":"x",plugins:{legend:{display:x.length>1,labels:{color:E.tick,boxWidth:10,usePointStyle:!0}}},scales:{x:{stacked:h,grid:{color:E.grid},ticks:{color:E.tick,font:{size:10}}},y:{stacked:h,grid:{color:E.grid},ticks:{color:E.tick,font:{size:10}}}},...S});return React.createElement(a,{type:"bar",data:g,height:M,options:_})},c=({labels:d,values:x,colors:M,height:m=220,cutout:h="68%",centerText:S})=>{let E=t(),y={labels:d,datasets:[{data:x,backgroundColor:M,borderWidth:0,hoverOffset:6}]},g=s({cutout:h,scales:{},plugins:{legend:{display:!0,position:"bottom",labels:{color:E.tick,boxWidth:10,usePointStyle:!0,padding:12}}}});return React.createElement(a,{type:"doughnut",data:y,height:m,options:g})},f=({labels:d,series:x,height:M=260})=>{let m=t(),h=[m.brand,m.cyan,m.amber],S={labels:d,datasets:x.map((y,g)=>({label:y.label,data:y.data,borderColor:y.color||h[g%h.length],borderWidth:2,backgroundColor:(y.color||h[g%h.length])+"22",pointBackgroundColor:y.color||h[g%h.length],pointRadius:3}))},E=s({scales:{r:{angleLines:{color:m.grid},grid:{color:m.grid},pointLabels:{color:m.tick,font:{size:10}},ticks:{display:!1,backdropColor:"transparent"},suggestedMin:0,suggestedMax:100}},plugins:{legend:{display:x.length>1,position:"bottom",labels:{color:m.tick,boxWidth:10,usePointStyle:!0}}}});return React.createElement(a,{type:"radar",data:S,height:M,options:E})},p=({points:d,height:x=240,xLabel:M,yLabel:m})=>{let h=t(),S={datasets:[{data:d,backgroundColor:h.cyan+"cc",pointRadius:5,pointHoverRadius:7}]},E=s({scales:{x:{title:{display:!!M,text:M,color:h.tick},grid:{color:h.grid},ticks:{color:h.tick,font:{size:10}}},y:{title:{display:!!m,text:m,color:h.tick},grid:{color:h.grid},ticks:{color:h.tick,font:{size:10}}}}});return React.createElement(a,{type:"scatter",data:S,height:x,options:E})},u=({items:d,height:x=200})=>{let M=t(),m=d.map(h=>n[h.key]||M.rose);return React.createElement(l,{labels:d.map(h=>h.label),height:x,series:[{label:"Probability",data:d.map(h=>Math.round(h.value*1e3)/10),colors:m.map(h=>h+"cc")}],opts:{scales:{y:{max:100,grid:{color:M.grid},ticks:{color:M.tick,callback:h=>h+"%"}},x:{grid:{display:!1},ticks:{color:M.tick,font:{size:9}}}}}})};window.CG.Charts={LineChart:o,BarChart:l,DoughnutChart:c,RadarChart:f,ScatterChart:p,ProbBars:u,themeColors:t}})();(function(){let{useRef:i,useEffect:e,useState:t}=React,n=window.L,s={low:"#10b981",medium:"#f59e0b",high:"#f43f5e"};n&&n.Icon&&n.Icon.Default&&n.Icon.Default.mergeOptions({iconRetinaUrl:"./vendor/leaflet/images/marker-icon-2x.png",iconUrl:"./vendor/leaflet/images/marker-icon.png",shadowUrl:"./vendor/leaflet/images/marker-shadow.png"});let a={satellite:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attr:"Esri World Imagery",max:19},street:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attr:"\xA9 OpenStreetMap",max:19},topo:{url:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",attr:"\xA9 OpenTopoMap",max:17},dark:{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attr:"\xA9 CARTO",max:19}};function r({fields:o,geojson:l,onSelect:c,selectedId:f,height:p="100%",base:u="satellite",overlay:d="risk",gridData:x=null}){let M=i(null),m=i(null),h=i(null),S=i(null),E=i(null);return e(()=>{if(m.current||!M.current)return;let y=o&&o.length?[o[0].lat,o[0].lon]:[15,101.7],g=n.map(M.current,{center:y,zoom:11,zoomControl:!0,attributionControl:!0});return m.current=g,h.current=n.layerGroup().addTo(g),E.current=n.layerGroup().addTo(g),setTimeout(()=>g.invalidateSize(),100),()=>{g.remove(),m.current=null}},[]),e(()=>{let y=m.current;if(!y)return;S.current&&y.removeLayer(S.current);let g=a[u]||a.satellite;S.current=n.tileLayer(g.url,{attribution:g.attr,maxZoom:g.max,subdomains:"abc"}).addTo(y),S.current.bringToBack()},[u]),e(()=>{let y=m.current,g=h.current;if(!y||!g||!l)return;g.clearLayers();let _=[];l.features.forEach(R=>{let v=R.properties,T=R.geometry.coordinates[0].map(O=>[O[1],O[0]]);_.push(...T);let C=s[v.risk_level]||"#10b981",N=v.id===f,L=n.polygon(T,{color:C,weight:N?3:1.6,fillColor:C,fillOpacity:d==="risk"?N?.5:.32:.12,opacity:.9});L.on("click",()=>c&&c(v.id)),L.on("mouseover",()=>L.setStyle({fillOpacity:.5,weight:3})),L.on("mouseout",()=>L.setStyle({fillOpacity:d==="risk"?N?.5:.32:.12,weight:N?3:1.6})),L.bindTooltip(`<div style="font-weight:600">${v.name_th||v.name}</div>
           <div style="opacity:.8;font-size:11px">${v.province} \xB7 ${v.variety}</div>
           <div style="font-size:11px;margin-top:2px">Health ${v.health_score}% \xB7 ${v.risk_level.toUpperCase()}</div>`,{sticky:!0,opacity:.95}),g.addLayer(L),n.circleMarker([v.lat,v.lon],{radius:4,color:"#fff",weight:1.5,fillColor:C,fillOpacity:1}).on("click",()=>c&&c(v.id)).addTo(g)}),_.length&&!f&&y.fitBounds(_,{padding:[40,40],maxZoom:12})},[JSON.stringify(l),f,d]),e(()=>{let y=m.current;if(!y||!f||!o)return;let g=o.find(_=>_.id===f);g&&y.flyTo([g.lat,g.lon],14,{duration:.8})},[f]),e(()=>{let y=E.current;if(!y||(y.clearLayers(),!x||!x.field||d==="risk"))return;let{field:g,grid:_,index:R}=x,v=JSON.parse(g.boundary_json||"[]");if(!v.length)return;let T=v.map(B=>B[0]),C=v.map(B=>B[1]),N=Math.min(...T),L=Math.max(...T),O=Math.min(...C),w=Math.max(...C),D=_.grid_size,P=(w-O)/D,V=(L-N)/D,Z={ndvi:B=>B>.6?"#065f46":B>.45?"#10b981":B>.3?"#fbbf24":"#dc2626",ndwi:B=>B>.2?"#0369a1":B>0?"#38bdf8":B>-.2?"#fcd34d":"#b45309",savi:B=>B>.55?"#065f46":B>.4?"#10b981":B>.25?"#fbbf24":"#dc2626",evi:B=>B>.55?"#065f46":B>.4?"#10b981":B>.25?"#fbbf24":"#dc2626"},H=Z[R]||Z.ndvi;for(let B=0;B<D;B++)for(let F=0;F<D;F++){let re=_.cells[B][F],ae=O+(D-1-B)*P,Ie=N+F*V;n.rectangle([[ae,Ie],[ae+P,Ie+V]],{color:H(re),weight:0,fillColor:H(re),fillOpacity:.6}).bindTooltip(`${R.toUpperCase()}: ${re}`,{sticky:!0}).addTo(y)}},[JSON.stringify(x),d]),React.createElement("div",{ref:M,style:{height:p,width:"100%",borderRadius:16,zIndex:0}})}window.CG.MapView=r,window.CG.RISK_COLOR=s})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,KPICard:s,Badge:a,ProgressRing:r,SkelCard:o,Skeleton:l,Icon:c,Empty:f}=window.CG.UI,{DoughnutChart:p,BarChart:u,LineChart:d}=window.CG.Charts,x={sunny:"sun",partly_cloudy:"cloud",cloudy:"cloud",rain:"drop",storm:"drop"};function M({go:m}){let{t:h,lang:S,toast:E}=window.CG.Store.useStore(),[y,g]=i(null),[_,R]=i(null),[v,T]=i(null),[C,N]=i(null);if(e(()=>{let w=window.CG.API_CLIENT;Promise.all([w.kpis(),w.riskDist(),w.healthByField(),w.weatherHistory(null,14)]).then(([D,P,V,Z])=>{g(D),R(P),T(V),N(Z)}).catch(D=>E(D.message,"error"))},[]),!y)return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},[0,1,2,3].map(w=>React.createElement(o,{key:w}))),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},[0,1,2].map(w=>React.createElement(o,{key:w,h:"h-48"}))));let L=_||{low:0,medium:0,high:0},O=(C?.series||[]).map(w=>w.date.slice(5));return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},React.createElement(s,{icon:"map",label:h("kpi_fields"),value:y.total_fields,tone:"brand",delay:0}),React.createElement(s,{icon:"leaf",label:h("kpi_plants"),value:y.total_plants,tone:"cyan",delay:60,spark:React.createElement("div",{className:"txt-dim text-[11px] mt-2"},y.total_area_rai.toLocaleString()," ",h("rai"))}),React.createElement(s,{icon:"check",label:h("kpi_healthy"),value:y.healthy_pct,suffix:"%",decimals:1,tone:"brand",delay:120}),React.createElement(s,{icon:"alert",label:h("kpi_risk"),value:y.high_risk_pct,suffix:"%",decimals:1,tone:"rose",delay:180})),React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},React.createElement(s,{icon:"brain",label:h("kpi_disease"),value:y.disease_alerts,tone:"rose",delay:0}),React.createElement(s,{icon:"soil",label:h("kpi_nutrient"),value:y.nutrient_alerts,tone:"amber",delay:60}),React.createElement(s,{icon:"drop",label:h("kpi_water"),value:y.water_alerts,tone:"cyan",delay:120}),React.createElement(s,{icon:"cpu",label:h("kpi_health"),value:y.avg_health,suffix:"%",decimals:1,tone:"violet",delay:180})),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"grid",title:h("risk_dist"),sub:`${y.total_fields} ${h("kpi_fields")}`}),React.createElement(p,{height:210,labels:[h("low"),h("medium"),h("high")],values:[L.low,L.medium,L.high],colors:["#10b981","#f59e0b","#f43f5e"]})),React.createElement(t,{className:"animate-fadeup lg:col-span-2",style:{animationDelay:"80ms"}},React.createElement(n,{icon:"map",title:h("field_health"),sub:h("dash_sub"),right:React.createElement(a,{tone:"online",dot:!0},h("online"))}),React.createElement(u,{height:210,horizontal:!0,labels:(v||[]).map(w=>S==="th"?w.name_th:w.name),series:[{label:"Health",data:(v||[]).map(w=>w.health),colors:(v||[]).map(w=>window.CG.RISK_COLOR[w.risk]+"cc")}],opts:{scales:{x:{max:100,grid:{color:"rgba(148,163,184,.12)"},ticks:{color:"#93a4bd",callback:w=>w+"%"}},y:{grid:{display:!1},ticks:{color:"#93a4bd",font:{size:10}}}}}}))),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup relative overflow-hidden"},React.createElement("div",{className:"absolute -right-8 -top-8 w-32 h-32 rounded-full bg-cyan2/10 blur-2xl"}),React.createElement(n,{icon:"cloud",title:h("weather_now")}),React.createElement("div",{className:"flex items-center gap-4"},React.createElement("div",{className:"w-16 h-16 rounded-2xl grad-brand grid place-items-center text-white shrink-0"},React.createElement(c,{name:x[y.weather.condition]||"cloud",className:"w-8 h-8"})),React.createElement("div",null,React.createElement("div",{className:"txt text-4xl font-bold tabular-nums"},y.weather.temp_c,"\xB0"),React.createElement("div",{className:"txt-soft text-sm"},S==="th"?y.weather.condition_th:y.weather.condition.replace("_"," ")))),React.createElement("div",{className:"grid grid-cols-2 gap-2 mt-4 text-sm"},React.createElement("div",{className:"glass rounded-xl p-3"},React.createElement("div",{className:"txt-dim text-xs"},"Humidity"),React.createElement("div",{className:"txt font-semibold"},y.weather.humidity_pct,"%")),React.createElement("div",{className:"glass rounded-xl p-3"},React.createElement("div",{className:"txt-dim text-xs"},"Rain 7d"),React.createElement("div",{className:"txt font-semibold"},y.weather.rain_7d_mm," mm"))),y.weather.warnings.length>0&&React.createElement("div",{className:"mt-3 space-y-1.5"},y.weather.warnings.map((w,D)=>React.createElement("div",{key:D,className:"flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 rounded-lg px-2.5 py-1.5"},React.createElement(c,{name:"alert",className:"w-3.5 h-3.5 shrink-0"}),S==="th"?w.th:w.en)))),React.createElement(t,{className:"animate-fadeup lg:col-span-2",style:{animationDelay:"80ms"}},React.createElement(n,{icon:"cloud",title:h("trend"),sub:"14 days \xB7 temp & rainfall",right:React.createElement("button",{onClick:()=>m("weather"),className:"txt-soft hover:txt text-xs flex items-center gap-1"},h("view"),React.createElement(c,{name:"chevron",className:"w-3.5 h-3.5"}))}),React.createElement(d,{height:210,fill:!0,labels:O,series:[{label:"Temp \xB0C",data:(C?.series||[]).map(w=>w.temp_c),color:"#f59e0b"},{label:"Rain mm",data:(C?.series||[]).map(w=>w.rainfall_mm),color:"#06b6d4"}]}))),React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"satellite",title:h("sat_status"),sub:`${y.satellite.online}/${y.satellite.constellation.length} ${h("online")}`,right:React.createElement("button",{onClick:()=>m("satellite"),className:"txt-soft hover:txt text-xs flex items-center gap-1"},h("view"),React.createElement(c,{name:"chevron",className:"w-3.5 h-3.5"}))}),React.createElement("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3"},y.satellite.constellation.map((w,D)=>React.createElement("div",{key:D,className:"glass rounded-xl p-3.5 relative"},React.createElement("div",{className:"flex items-center justify-between"},React.createElement(c,{name:"satellite",className:"w-5 h-5 text-cyan2-light"}),React.createElement("span",{className:"relative flex h-2.5 w-2.5"},w.status==="online"&&React.createElement("span",{className:"absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-pulsering"}),React.createElement("span",{className:`relative inline-flex rounded-full h-2.5 w-2.5 ${w.status==="online"?"bg-brand-400":"bg-amber-400"}`}))),React.createElement("div",{className:"txt font-semibold text-sm mt-2"},w.name),React.createElement("div",{className:"txt-dim text-[11px] mt-0.5"},w.resolution_m,"m \xB7 ",w.revisit_days,"d revisit"))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Dashboard=M})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,ProgressRing:a,Icon:r,Segmented:o,Spinner:l,Skeleton:c,Modal:f}=window.CG.UI,{LineChart:p}=window.CG.Charts,u=[{value:"satellite",label:"Satellite"},{value:"street",label:"Street"},{value:"topo",label:"Topo"},{value:"dark",label:"Dark"}],d=[{value:"risk",label:"Risk"},{value:"ndvi",label:"NDVI"},{value:"ndwi",label:"NDMI"},{value:"savi",label:"SAVI"}];function x({go:g}){let{t:_,lang:R,toast:v,user:T}=window.CG.Store.useStore(),[C,N]=i(null),[L,O]=i([]),[w,D]=i(null),[P,V]=i(null),[Z,H]=i("satellite"),[B,F]=i("risk"),[re,ae]=i(null),[Ie,Me]=i(!1),Pe=(te=null)=>{let ge=window.CG.API_CLIENT;return Promise.all([ge.fieldsGeo(),ge.fields()]).then(([De,pe])=>{N(De),O(pe),te?D(te):pe.length&&D(Be=>Be||pe[0].id)}).catch(De=>v(De.message,"error"))};e(()=>{Pe()},[]),e(()=>{w&&(V(null),window.CG.API_CLIENT.field(w).then(V).catch(te=>v(te.message,"error")))},[w]),e(()=>{if(!w||B==="risk"){ae(null);return}window.CG.API_CLIENT.satGrid(w,B).then(te=>ae({field:P,grid:te,index:B})).catch(()=>{})},[w,B,P]);let J=window.CG.MapView;return React.createElement(React.Fragment,null,React.createElement("div",{className:"grid lg:grid-cols-3 gap-4 h-full"},React.createElement(t,{pad:"p-0",className:"lg:col-span-2 overflow-hidden relative min-h-[520px] animate-fadeup"},React.createElement("div",{className:"absolute top-3 left-3 right-3 z-[500] flex flex-wrap gap-2 justify-between pointer-events-none"},React.createElement("div",{className:"pointer-events-auto"},React.createElement(o,{options:u,value:Z,onChange:H})),React.createElement("div",{className:"pointer-events-auto flex gap-2"},T.role!=="researcher"&&React.createElement("button",{onClick:()=>Me(!0),className:"glass-strong rounded-xl px-3 py-2 txt-soft hover:txt flex items-center gap-1.5 text-xs font-semibold"},React.createElement(r,{name:"plus",className:"w-4 h-4"}),R==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07":"Add field"),React.createElement(o,{options:d,value:B,onChange:F}))),React.createElement("div",{className:"absolute bottom-3 left-3 z-[500] glass-strong rounded-xl px-3 py-2 text-[11px] txt-soft"},B==="risk"?React.createElement("div",{className:"flex items-center gap-3"},[["low",_("low")],["medium",_("medium")],["high",_("high")]].map(([te,ge])=>React.createElement("span",{key:te,className:"flex items-center gap-1"},React.createElement("span",{className:"w-2.5 h-2.5 rounded-sm",style:{background:window.CG.RISK_COLOR[te]}}),ge))):React.createElement("div",{className:"flex items-center gap-2"},React.createElement("span",{className:"font-semibold txt"},B.toUpperCase()),React.createElement("span",{className:"w-24 h-2.5 rounded-full",style:{background:"linear-gradient(90deg,#dc2626,#fbbf24,#10b981,#065f46)"}}),React.createElement("span",null,"low \u2192 high"))),C?React.createElement(J,{fields:L,geojson:C,onSelect:D,selectedId:w,base:Z,overlay:B,gridData:re}):React.createElement("div",{className:"h-full grid place-items-center"},React.createElement(l,{className:"w-8 h-8 text-brand-400"}))),React.createElement("div",{className:"space-y-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] pr-1"},P?React.createElement(h,{d:P,go:g}):React.createElement(t,null,React.createElement("div",{className:"space-y-3"},React.createElement(c,{className:"h-6 w-2/3"}),React.createElement(c,{className:"h-24 w-full"}),React.createElement(c,{className:"h-16 w-full"}))))),React.createElement(M,{open:Ie,onClose:()=>Me(!1),onCreated:async te=>{await Pe(te.id),Me(!1)}}))}function M({open:g,onClose:_,onCreated:R}){let{lang:v,toast:T}=window.CG.Store.useStore(),[C,N]=i(!1),[L,O]=i({name:"",name_th:"",province:"",variety:"KU50",area_rai:"10",lat:"15",lon:"102"}),w=(P,V)=>O(Z=>({...Z,[P]:V}));return React.createElement(f,{open:g,onClose:_,title:v==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1E\u0E32\u0E30\u0E1B\u0E25\u0E39\u0E01":"Add field"},React.createElement("form",{onSubmit:async P=>{P.preventDefault(),N(!0);try{let V=await window.CG.API_CLIENT.createField({...L,area_rai:Number(L.area_rai),lat:Number(L.lat),lon:Number(L.lon)});T(v==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E49\u0E27":"Field created","success"),await R(V)}catch(V){T(V.message,"error")}finally{N(!1)}},className:"grid sm:grid-cols-2 gap-3"},React.createElement(m,{label:v==="th"?"\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1B\u0E25\u0E07 (\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29)":"Field name",value:L.name,onChange:P=>w("name",P),required:!0}),React.createElement(m,{label:v==="th"?"\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1B\u0E25\u0E07 (\u0E44\u0E17\u0E22)":"Thai name",value:L.name_th,onChange:P=>w("name_th",P)}),React.createElement(m,{label:v==="th"?"\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14":"Province",value:L.province,onChange:P=>w("province",P)}),React.createElement(m,{label:v==="th"?"\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C":"Variety",value:L.variety,onChange:P=>w("variety",P),required:!0}),React.createElement(m,{label:v==="th"?"\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48 (\u0E44\u0E23\u0E48)":"Area (rai)",type:"number",min:"0.1",step:"0.1",value:L.area_rai,onChange:P=>w("area_rai",P),required:!0}),React.createElement("div",null),React.createElement(m,{label:"Latitude",type:"number",min:"-90",max:"90",step:"0.000001",value:L.lat,onChange:P=>w("lat",P),required:!0}),React.createElement(m,{label:"Longitude",type:"number",min:"-180",max:"180",step:"0.000001",value:L.lon,onChange:P=>w("lon",P),required:!0}),React.createElement("div",{className:"sm:col-span-2 flex justify-end gap-2 pt-2"},React.createElement("button",{type:"button",onClick:_,className:"glass rounded-xl px-4 py-2 txt-soft text-sm"},v==="th"?"\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01":"Cancel"),React.createElement("button",{disabled:C,className:"grad-brand rounded-xl px-4 py-2 text-white text-sm font-semibold disabled:opacity-50"},C?v==="th"?"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u2026":"Saving\u2026":v==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E1B\u0E25\u0E07":"Save field"))))}function m({label:g,value:_,onChange:R,type:v="text",...T}){return React.createElement("label",{className:"txt-dim text-xs"},g,React.createElement("input",{type:v,value:_,onChange:C=>R(C.target.value),className:"w-full mt-1 glass rounded-xl px-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40",...T}))}function h({d:g,go:_}){let{t:R,lang:v}=window.CG.Store.useStore(),T=v==="th"&&g.name_th||g.name;return React.createElement(React.Fragment,null,React.createElement(t,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-start justify-between gap-2"},React.createElement("div",null,React.createElement("h3",{className:"txt font-bold text-lg leading-tight"},T),React.createElement("p",{className:"txt-soft text-xs mt-0.5"},g.province," \xB7 ",g.variety)),React.createElement(s,{tone:g.risk_level},R(g.risk_level))),React.createElement("div",{className:"flex items-center gap-4 mt-4"},React.createElement(a,{value:g.health_score,label:R("kpi_health")}),React.createElement("div",{className:"flex-1 grid grid-cols-2 gap-2 text-sm"},React.createElement(S,{label:R("rai"),value:g.area_rai}),React.createElement(S,{label:R("age"),value:`${g.age_days} ${R("days")}`}),React.createElement(S,{label:"Plants",value:g.plant_count.toLocaleString()}),React.createElement(S,{label:"NDVI",value:g.current_indices.ndvi??"\u2013"})))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"cloud",title:R("weather_now")}),React.createElement("div",{className:"grid grid-cols-3 gap-2 text-center text-sm"},React.createElement(E,{icon:"temp",v:`${g.weather.today.temp_c}\xB0`,l:"Temp"}),React.createElement(E,{icon:"drop",v:`${g.weather.today.humidity_pct}%`,l:"Humidity"}),React.createElement(E,{icon:"cloud",v:`${g.weather.rain_7d_mm}`,l:"Rain 7d mm"}))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"120ms"}},React.createElement(n,{icon:"satellite",title:"NDVI",sub:"8 months",right:React.createElement("button",{onClick:()=>_("satellite",g.id),className:"txt-soft hover:txt text-xs"},R("view"))}),React.createElement(p,{height:140,fill:!0,labels:g.ndvi_series.map(C=>C.date.slice(2,7)),series:[{label:"NDVI",data:g.ndvi_series.map(C=>C.ndvi),color:"#10b981"}],opts:{scales:{y:{min:0,max:1,grid:{color:"rgba(148,163,184,.12)"},ticks:{color:"#93a4bd",font:{size:9}}},x:{grid:{display:!1},ticks:{color:"#93a4bd",font:{size:9}}}}}})),g.predicted_risks.length>0&&React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"160ms"}},React.createElement(n,{icon:"alert",title:R("kpi_risk")}),React.createElement("div",{className:"space-y-2"},g.predicted_risks.map((C,N)=>React.createElement("div",{key:N,className:"flex items-center justify-between glass rounded-xl px-3 py-2"},React.createElement("span",{className:"txt text-sm"},v==="th"?C.th:C.en),React.createElement(s,{tone:C.severity,className:"shrink-0"},Math.round(C.confidence*100),"%"))))),g.recommendations.length>0&&React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"200ms"}},React.createElement(n,{icon:"bulb",title:R("recommendation"),right:React.createElement("button",{onClick:()=>_("recommendations",g.id),className:"txt-soft hover:txt text-xs"},R("view"))}),React.createElement(y,{r:g.recommendations[0]})))}let S=({label:g,value:_})=>React.createElement("div",{className:"glass rounded-lg px-2.5 py-1.5"},React.createElement("div",{className:"txt-dim text-[10px]"},g),React.createElement("div",{className:"txt font-semibold text-sm"},_)),E=({icon:g,v:_,l:R})=>React.createElement("div",{className:"glass rounded-xl py-3"},React.createElement(r,{name:g,className:"w-4 h-4 mx-auto text-cyan2-light"}),React.createElement("div",{className:"txt font-bold mt-1"},_),React.createElement("div",{className:"txt-dim text-[10px]"},R));function y({r:g}){let{lang:_}=window.CG.Store.useStore(),{Badge:R,Icon:v}=window.CG.UI;return React.createElement("div",null,React.createElement("div",{className:"flex items-center justify-between mb-2"},React.createElement("span",{className:"txt font-semibold text-sm"},_==="th"?g.title_th:g.title_en),React.createElement(R,{tone:g.severity},Math.round(g.confidence*100),"%")),React.createElement("ul",{className:"space-y-1"},(_==="th"?g.actions_th:g.actions_en).slice(0,2).map((T,C)=>React.createElement("li",{key:C,className:"flex items-start gap-2 txt-soft text-xs"},React.createElement(v,{name:"check",className:"w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5"}),T))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.FieldMap=x})();var bc=0,Qo=1,Sc=2;var qs=1,gr=2,$i=3,Zn=0,kt=1,Dt=2,Mn=0,Zi=1,el=2,tl=3,nl=4,Mc=5;var oi=100,wc=101,Tc=102,Ec=103,Ac=104,Cc=200,Rc=201,Nc=202,Ic=203,il=204,sl=205,Pc=206,Lc=207,Dc=208,Uc=209,Fc=210,Oc=211,Bc=212,kc=213,zc=214,La=0,Da=1,Ua=2,Ii=3,Fa=4,Oa=5,Ba=6,ka=7,al=0,Gc=1,Vc=2,cn=0,rl=1,ol=2,ll=3,Ys=4,cl=5,dl=6,hl=7;var ul=300,Jn=301,li=302,xr=303,vr=304,$s=306,za=1e3,vn=1001,Ga=1002,Et=1003,Hc=1004;var Zs=1005;var Ct=1006,_r=1007;var Kn=1008;var Xt=1009,fl=1010,pl=1011,Ji=1012,yr=1013,dn=1014,hn=1015,un=1016,br=1017,Sr=1018,Ki=1020,ml=35902,gl=35899,xl=1021,vl=1022,tn=1023,yn=1026,jn=1027,_l=1028,Mr=1029,Qn=1030,wr=1031;var Tr=1033,Js=33776,Ks=33777,js=33778,Qs=33779,Er=35840,Ar=35841,Cr=35842,Rr=35843,Nr=36196,Ir=37492,Pr=37496,Lr=37488,Dr=37489,ea=37490,Ur=37491,Fr=37808,Or=37809,Br=37810,kr=37811,zr=37812,Gr=37813,Vr=37814,Hr=37815,Wr=37816,Xr=37817,qr=37818,Yr=37819,$r=37820,Zr=37821,Jr=36492,Kr=36494,jr=36495,Qr=36283,eo=36284,ta=36285,to=36286;var fs=2300,Va=2301,Ia=2302,Go=2303,Vo=2400,Ho=2401,Wo=2402;var Wc=3200;var no=0,Xc=1,Ln="",Bt="srgb",ps="srgb-linear",ms="linear",at="srgb";var Pa=7680;var qc=519,Yc=512,$c=513,Zc=514,io=515,Jc=516,Kc=517,so=518,jc=519,Qc=35044;var yl="300 es",ln=2e3,Pi=2001;function zd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Gd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function gs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ed(){let i=gs("canvas");return i.style.display="block",i}var $l={},Li=null;function bl(...i){let e="THREE."+i.shift();Li?Li("log",e,...i):console.log(e,...i)}function td(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Fe(...i){i=td(i);let e="THREE."+i.shift();if(Li)Li("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function ke(...i){i=td(i);let e="THREE."+i.shift();if(Li)Li("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function si(...i){let e=i.join(" ");e in $l||($l[e]=!0,Fe(...i))}function nd(i,e,t){return new Promise(function(n,s){function a(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:n()}}setTimeout(a,t)})}var id={[La]:Da,[Ua]:Ba,[Fa]:ka,[Ii]:Oa,[Da]:La,[Ba]:Ua,[ka]:Fa,[Oa]:Ii},bn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let a=s.indexOf(t);a!==-1&&s.splice(a,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,e);e.target=null}}},Nt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var mo=Math.PI/180,Ha=180/Math.PI;function ji(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Nt[i&255]+Nt[i>>8&255]+Nt[i>>16&255]+Nt[i>>24&255]+"-"+Nt[e&255]+Nt[e>>8&255]+"-"+Nt[e>>16&15|64]+Nt[e>>24&255]+"-"+Nt[t&63|128]+Nt[t>>8&255]+"-"+Nt[t>>16&255]+Nt[t>>24&255]+Nt[n&255]+Nt[n>>8&255]+Nt[n>>16&255]+Nt[n>>24&255]).toLowerCase()}function Ye(i,e,t){return Math.max(e,Math.min(t,i))}function Vd(i,e){return(i%e+e)%e}function go(i,e,t){return(1-t)*i+t*e}function as(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Gt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Al=class Al{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ye(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ye(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),a=this.x-e.x,r=this.y-e.y;return this.x=a*n-r*s+e.x,this.y=a*s+r*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Al.prototype.isVector2=!0;var me=Al,Sn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,a,r,o){let l=n[s+0],c=n[s+1],f=n[s+2],p=n[s+3],u=a[r+0],d=a[r+1],x=a[r+2],M=a[r+3];if(p!==M||l!==u||c!==d||f!==x){let m=l*u+c*d+f*x+p*M;m<0&&(u=-u,d=-d,x=-x,M=-M,m=-m);let h=1-o;if(m<.9995){let S=Math.acos(m),E=Math.sin(S);h=Math.sin(h*S)/E,o=Math.sin(o*S)/E,l=l*h+u*o,c=c*h+d*o,f=f*h+x*o,p=p*h+M*o}else{l=l*h+u*o,c=c*h+d*o,f=f*h+x*o,p=p*h+M*o;let S=1/Math.sqrt(l*l+c*c+f*f+p*p);l*=S,c*=S,f*=S,p*=S}}e[t]=l,e[t+1]=c,e[t+2]=f,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,s,a,r){let o=n[s],l=n[s+1],c=n[s+2],f=n[s+3],p=a[r],u=a[r+1],d=a[r+2],x=a[r+3];return e[t]=o*x+f*p+l*d-c*u,e[t+1]=l*x+f*u+c*p-o*d,e[t+2]=c*x+f*d+o*u-l*p,e[t+3]=f*x-o*p-l*u-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,a=e._z,r=e._order,o=Math.cos,l=Math.sin,c=o(n/2),f=o(s/2),p=o(a/2),u=l(n/2),d=l(s/2),x=l(a/2);switch(r){case"XYZ":this._x=u*f*p+c*d*x,this._y=c*d*p-u*f*x,this._z=c*f*x+u*d*p,this._w=c*f*p-u*d*x;break;case"YXZ":this._x=u*f*p+c*d*x,this._y=c*d*p-u*f*x,this._z=c*f*x-u*d*p,this._w=c*f*p+u*d*x;break;case"ZXY":this._x=u*f*p-c*d*x,this._y=c*d*p+u*f*x,this._z=c*f*x+u*d*p,this._w=c*f*p-u*d*x;break;case"ZYX":this._x=u*f*p-c*d*x,this._y=c*d*p+u*f*x,this._z=c*f*x-u*d*p,this._w=c*f*p+u*d*x;break;case"YZX":this._x=u*f*p+c*d*x,this._y=c*d*p+u*f*x,this._z=c*f*x-u*d*p,this._w=c*f*p-u*d*x;break;case"XZY":this._x=u*f*p-c*d*x,this._y=c*d*p-u*f*x,this._z=c*f*x+u*d*p,this._w=c*f*p+u*d*x;break;default:Fe("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],a=t[8],r=t[1],o=t[5],l=t[9],c=t[2],f=t[6],p=t[10],u=n+o+p;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(f-l)*d,this._y=(a-c)*d,this._z=(r-s)*d}else if(n>o&&n>p){let d=2*Math.sqrt(1+n-o-p);this._w=(f-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+c)/d}else if(o>p){let d=2*Math.sqrt(1+o-n-p);this._w=(a-c)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+f)/d}else{let d=2*Math.sqrt(1+p-n-o);this._w=(r-s)/d,this._x=(a+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ye(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,a=e._z,r=e._w,o=t._x,l=t._y,c=t._z,f=t._w;return this._x=n*f+r*o+s*c-a*l,this._y=s*f+r*l+a*o-n*c,this._z=a*f+r*c+n*l-s*o,this._w=r*f-n*o-s*l-a*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,a=e._z,r=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,a=-a,r=-r,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),f=Math.sin(c);l=Math.sin(l*c)/f,t=Math.sin(t*c)/f,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+a*t,this._w=this._w*l+r*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+a*t,this._w=this._w*l+r*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),a=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Cl=class Cl{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zl.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[3]*n+a[6]*s,this.y=a[1]*t+a[4]*n+a[7]*s,this.z=a[2]*t+a[5]*n+a[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,a=e.elements,r=1/(a[3]*t+a[7]*n+a[11]*s+a[15]);return this.x=(a[0]*t+a[4]*n+a[8]*s+a[12])*r,this.y=(a[1]*t+a[5]*n+a[9]*s+a[13])*r,this.z=(a[2]*t+a[6]*n+a[10]*s+a[14])*r,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,a=e.x,r=e.y,o=e.z,l=e.w,c=2*(r*s-o*n),f=2*(o*t-a*s),p=2*(a*n-r*t);return this.x=t+l*c+r*p-o*f,this.y=n+l*f+o*c-a*p,this.z=s+l*p+a*f-r*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s,this.y=a[1]*t+a[5]*n+a[9]*s,this.z=a[2]*t+a[6]*n+a[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ye(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,a=e.z,r=t.x,o=t.y,l=t.z;return this.x=s*l-a*o,this.y=a*r-n*l,this.z=n*o-s*r,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return xo.copy(this).projectOnVector(e),this.sub(xo)}reflect(e){return this.sub(xo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ye(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Cl.prototype.isVector3=!0;var k=Cl,xo=new k,Zl=new Sn,Rl=class Rl{constructor(e,t,n,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,a,r,o,l,c)}set(e,t,n,s,a,r,o,l,c){let f=this.elements;return f[0]=e,f[1]=s,f[2]=o,f[3]=t,f[4]=a,f[5]=l,f[6]=n,f[7]=r,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,a=this.elements,r=n[0],o=n[3],l=n[6],c=n[1],f=n[4],p=n[7],u=n[2],d=n[5],x=n[8],M=s[0],m=s[3],h=s[6],S=s[1],E=s[4],y=s[7],g=s[2],_=s[5],R=s[8];return a[0]=r*M+o*S+l*g,a[3]=r*m+o*E+l*_,a[6]=r*h+o*y+l*R,a[1]=c*M+f*S+p*g,a[4]=c*m+f*E+p*_,a[7]=c*h+f*y+p*R,a[2]=u*M+d*S+x*g,a[5]=u*m+d*E+x*_,a[8]=u*h+d*y+x*R,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],r=e[4],o=e[5],l=e[6],c=e[7],f=e[8];return t*r*f-t*o*c-n*a*f+n*o*l+s*a*c-s*r*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],r=e[4],o=e[5],l=e[6],c=e[7],f=e[8],p=f*r-o*c,u=o*l-f*a,d=c*a-r*l,x=t*p+n*u+s*d;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let M=1/x;return e[0]=p*M,e[1]=(s*c-f*n)*M,e[2]=(o*n-s*r)*M,e[3]=u*M,e[4]=(f*t-s*l)*M,e[5]=(s*a-o*t)*M,e[6]=d*M,e[7]=(n*l-c*t)*M,e[8]=(r*t-n*a)*M,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(n*l,n*c,-n*(l*r+c*o)+r+e,-s*c,s*l,-s*(-c*r+l*o)+o+t,0,0,1),this}scale(e,t){return si("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(vo.makeScale(e,t)),this}rotate(e){return si("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(vo.makeRotation(-e)),this}translate(e,t){return si("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(vo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Rl.prototype.isMatrix3=!0;var Ge=Rl,vo=new Ge,Jl=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Kl=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Hd(){let i={enabled:!0,workingColorSpace:ps,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===at&&(s.r=In(s.r),s.g=In(s.g),s.b=In(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===at&&(s.r=Ri(s.r),s.g=Ri(s.g),s.b=Ri(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ln?ms:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return si("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return si("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,a)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ps]:{primaries:e,whitePoint:n,transfer:ms,toXYZ:Jl,fromXYZ:Kl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Bt},outputColorSpaceConfig:{drawingBufferColorSpace:Bt}},[Bt]:{primaries:e,whitePoint:n,transfer:at,toXYZ:Jl,fromXYZ:Kl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Bt}}}),i}var Je=Hd();function In(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ri(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var gi,Wa=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{gi===void 0&&(gi=gs("canvas")),gi.width=e.width,gi.height=e.height;let s=gi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=gi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=gs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=In(a[r]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(In(t[n]/255)*255):t[n]=In(t[n]);return{data:t,width:e.width,height:e.height}}else return Fe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Wd=0,Di=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=ji(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(_o(s[r].image)):a.push(_o(s[r]))}else a=_o(s);n.url=a}return t||(e.images[this.uuid]=n),n}};function _o(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Wa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Fe("Texture: Unable to serialize Texture."),{})}var Xd=0,yo=new k,Vt=class i extends bn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=vn,s=vn,a=Ct,r=Kn,o=tn,l=Xt,c=i.DEFAULT_ANISOTROPY,f=Ln){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=ji(),this.name="",this.source=new Di(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new me(0,0),this.repeat=new me(1,1),this.center=new me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(yo).x}get height(){return this.source.getSize(yo).y}get depth(){return this.source.getSize(yo).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Fe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Fe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ul)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case za:e.x=e.x-Math.floor(e.x);break;case vn:e.x=e.x<0?0:1;break;case Ga:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case za:e.y=e.y-Math.floor(e.y);break;case vn:e.y=e.y<0?0:1;break;case Ga:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Vt.DEFAULT_IMAGE=null;Vt.DEFAULT_MAPPING=ul;Vt.DEFAULT_ANISOTROPY=1;var Nl=class Nl{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,a=this.w,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s+r[12]*a,this.y=r[1]*t+r[5]*n+r[9]*s+r[13]*a,this.z=r[2]*t+r[6]*n+r[10]*s+r[14]*a,this.w=r[3]*t+r[7]*n+r[11]*s+r[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,a,l=e.elements,c=l[0],f=l[4],p=l[8],u=l[1],d=l[5],x=l[9],M=l[2],m=l[6],h=l[10];if(Math.abs(f-u)<.01&&Math.abs(p-M)<.01&&Math.abs(x-m)<.01){if(Math.abs(f+u)<.1&&Math.abs(p+M)<.1&&Math.abs(x+m)<.1&&Math.abs(c+d+h-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(c+1)/2,y=(d+1)/2,g=(h+1)/2,_=(f+u)/4,R=(p+M)/4,v=(x+m)/4;return E>y&&E>g?E<.01?(n=0,s=.707106781,a=.707106781):(n=Math.sqrt(E),s=_/n,a=R/n):y>g?y<.01?(n=.707106781,s=0,a=.707106781):(s=Math.sqrt(y),n=_/s,a=v/s):g<.01?(n=.707106781,s=.707106781,a=0):(a=Math.sqrt(g),n=R/a,s=v/a),this.set(n,s,a,t),this}let S=Math.sqrt((m-x)*(m-x)+(p-M)*(p-M)+(u-f)*(u-f));return Math.abs(S)<.001&&(S=1),this.x=(m-x)/S,this.y=(p-M)/S,this.z=(u-f)/S,this.w=Math.acos((c+d+h-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this.w=Ye(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this.w=Ye(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ye(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Nl.prototype.isVector4=!0;var xt=Nl,Xa=class extends bn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ct,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},a=new Vt(s),r=n.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ct,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Di(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ht=class extends Xa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},xs=class extends Vt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var qa=class extends Vt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var mr=class mr{constructor(e,t,n,s,a,r,o,l,c,f,p,u,d,x,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,a,r,o,l,c,f,p,u,d,x,M,m)}set(e,t,n,s,a,r,o,l,c,f,p,u,d,x,M,m){let h=this.elements;return h[0]=e,h[4]=t,h[8]=n,h[12]=s,h[1]=a,h[5]=r,h[9]=o,h[13]=l,h[2]=c,h[6]=f,h[10]=p,h[14]=u,h[3]=d,h[7]=x,h[11]=M,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new mr().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/xi.setFromMatrixColumn(e,0).length(),a=1/xi.setFromMatrixColumn(e,1).length(),r=1/xi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=0,t[8]=n[8]*r,t[9]=n[9]*r,t[10]=n[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,a=e.z,r=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),f=Math.cos(a),p=Math.sin(a);if(e.order==="XYZ"){let u=r*f,d=r*p,x=o*f,M=o*p;t[0]=l*f,t[4]=-l*p,t[8]=c,t[1]=d+x*c,t[5]=u-M*c,t[9]=-o*l,t[2]=M-u*c,t[6]=x+d*c,t[10]=r*l}else if(e.order==="YXZ"){let u=l*f,d=l*p,x=c*f,M=c*p;t[0]=u+M*o,t[4]=x*o-d,t[8]=r*c,t[1]=r*p,t[5]=r*f,t[9]=-o,t[2]=d*o-x,t[6]=M+u*o,t[10]=r*l}else if(e.order==="ZXY"){let u=l*f,d=l*p,x=c*f,M=c*p;t[0]=u-M*o,t[4]=-r*p,t[8]=x+d*o,t[1]=d+x*o,t[5]=r*f,t[9]=M-u*o,t[2]=-r*c,t[6]=o,t[10]=r*l}else if(e.order==="ZYX"){let u=r*f,d=r*p,x=o*f,M=o*p;t[0]=l*f,t[4]=x*c-d,t[8]=u*c+M,t[1]=l*p,t[5]=M*c+u,t[9]=d*c-x,t[2]=-c,t[6]=o*l,t[10]=r*l}else if(e.order==="YZX"){let u=r*l,d=r*c,x=o*l,M=o*c;t[0]=l*f,t[4]=M-u*p,t[8]=x*p+d,t[1]=p,t[5]=r*f,t[9]=-o*f,t[2]=-c*f,t[6]=d*p+x,t[10]=u-M*p}else if(e.order==="XZY"){let u=r*l,d=r*c,x=o*l,M=o*c;t[0]=l*f,t[4]=-p,t[8]=c*f,t[1]=u*p+M,t[5]=r*f,t[9]=d*p-x,t[2]=x*p-d,t[6]=o*f,t[10]=M*p+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qd,e,Yd)}lookAt(e,t,n){let s=this.elements;return Yt.subVectors(e,t),Yt.lengthSq()===0&&(Yt.z=1),Yt.normalize(),On.crossVectors(n,Yt),On.lengthSq()===0&&(Math.abs(n.z)===1?Yt.x+=1e-4:Yt.z+=1e-4,Yt.normalize(),On.crossVectors(n,Yt)),On.normalize(),da.crossVectors(Yt,On),s[0]=On.x,s[4]=da.x,s[8]=Yt.x,s[1]=On.y,s[5]=da.y,s[9]=Yt.y,s[2]=On.z,s[6]=da.z,s[10]=Yt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,a=this.elements,r=n[0],o=n[4],l=n[8],c=n[12],f=n[1],p=n[5],u=n[9],d=n[13],x=n[2],M=n[6],m=n[10],h=n[14],S=n[3],E=n[7],y=n[11],g=n[15],_=s[0],R=s[4],v=s[8],T=s[12],C=s[1],N=s[5],L=s[9],O=s[13],w=s[2],D=s[6],P=s[10],V=s[14],Z=s[3],H=s[7],B=s[11],F=s[15];return a[0]=r*_+o*C+l*w+c*Z,a[4]=r*R+o*N+l*D+c*H,a[8]=r*v+o*L+l*P+c*B,a[12]=r*T+o*O+l*V+c*F,a[1]=f*_+p*C+u*w+d*Z,a[5]=f*R+p*N+u*D+d*H,a[9]=f*v+p*L+u*P+d*B,a[13]=f*T+p*O+u*V+d*F,a[2]=x*_+M*C+m*w+h*Z,a[6]=x*R+M*N+m*D+h*H,a[10]=x*v+M*L+m*P+h*B,a[14]=x*T+M*O+m*V+h*F,a[3]=S*_+E*C+y*w+g*Z,a[7]=S*R+E*N+y*D+g*H,a[11]=S*v+E*L+y*P+g*B,a[15]=S*T+E*O+y*V+g*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],a=e[12],r=e[1],o=e[5],l=e[9],c=e[13],f=e[2],p=e[6],u=e[10],d=e[14],x=e[3],M=e[7],m=e[11],h=e[15],S=l*d-c*u,E=o*d-c*p,y=o*u-l*p,g=r*d-c*f,_=r*u-l*f,R=r*p-o*f;return t*(M*S-m*E+h*y)-n*(x*S-m*g+h*_)+s*(x*E-M*g+h*R)-a*(x*y-M*_+m*R)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],a=e[1],r=e[5],o=e[9],l=e[2],c=e[6],f=e[10];return t*(r*f-o*c)-n*(a*f-o*l)+s*(a*c-r*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],r=e[4],o=e[5],l=e[6],c=e[7],f=e[8],p=e[9],u=e[10],d=e[11],x=e[12],M=e[13],m=e[14],h=e[15],S=t*o-n*r,E=t*l-s*r,y=t*c-a*r,g=n*l-s*o,_=n*c-a*o,R=s*c-a*l,v=f*M-p*x,T=f*m-u*x,C=f*h-d*x,N=p*m-u*M,L=p*h-d*M,O=u*h-d*m,w=S*O-E*L+y*N+g*C-_*T+R*v;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/w;return e[0]=(o*O-l*L+c*N)*D,e[1]=(s*L-n*O-a*N)*D,e[2]=(M*R-m*_+h*g)*D,e[3]=(u*_-p*R-d*g)*D,e[4]=(l*C-r*O-c*T)*D,e[5]=(t*O-s*C+a*T)*D,e[6]=(m*y-x*R-h*E)*D,e[7]=(f*R-u*y+d*E)*D,e[8]=(r*L-o*C+c*v)*D,e[9]=(n*C-t*L-a*v)*D,e[10]=(x*_-M*y+h*S)*D,e[11]=(p*y-f*_-d*S)*D,e[12]=(o*T-r*N-l*v)*D,e[13]=(t*N-n*T+s*v)*D,e[14]=(M*E-x*g-m*S)*D,e[15]=(f*g-p*E+u*S)*D,this}scale(e){let t=this.elements,n=e.x,s=e.y,a=e.z;return t[0]*=n,t[4]*=s,t[8]*=a,t[1]*=n,t[5]*=s,t[9]*=a,t[2]*=n,t[6]*=s,t[10]*=a,t[3]*=n,t[7]*=s,t[11]*=a,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),a=1-n,r=e.x,o=e.y,l=e.z,c=a*r,f=a*o;return this.set(c*r+n,c*o-s*l,c*l+s*o,0,c*o+s*l,f*o+n,f*l-s*r,0,c*l-s*o,f*l+s*r,a*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,a,r){return this.set(1,n,a,0,e,1,r,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,a=t._x,r=t._y,o=t._z,l=t._w,c=a+a,f=r+r,p=o+o,u=a*c,d=a*f,x=a*p,M=r*f,m=r*p,h=o*p,S=l*c,E=l*f,y=l*p,g=n.x,_=n.y,R=n.z;return s[0]=(1-(M+h))*g,s[1]=(d+y)*g,s[2]=(x-E)*g,s[3]=0,s[4]=(d-y)*_,s[5]=(1-(u+h))*_,s[6]=(m+S)*_,s[7]=0,s[8]=(x+E)*R,s[9]=(m-S)*R,s[10]=(1-(u+M))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let a=this.determinantAffine();if(a===0)return n.set(1,1,1),t.identity(),this;let r=xi.set(s[0],s[1],s[2]).length(),o=xi.set(s[4],s[5],s[6]).length(),l=xi.set(s[8],s[9],s[10]).length();a<0&&(r=-r),sn.copy(this);let c=1/r,f=1/o,p=1/l;return sn.elements[0]*=c,sn.elements[1]*=c,sn.elements[2]*=c,sn.elements[4]*=f,sn.elements[5]*=f,sn.elements[6]*=f,sn.elements[8]*=p,sn.elements[9]*=p,sn.elements[10]*=p,t.setFromRotationMatrix(sn),n.x=r,n.y=o,n.z=l,this}makePerspective(e,t,n,s,a,r,o=ln,l=!1){let c=this.elements,f=2*a/(t-e),p=2*a/(n-s),u=(t+e)/(t-e),d=(n+s)/(n-s),x,M;if(l)x=a/(r-a),M=r*a/(r-a);else if(o===ln)x=-(r+a)/(r-a),M=-2*r*a/(r-a);else if(o===Pi)x=-r/(r-a),M=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,a,r,o=ln,l=!1){let c=this.elements,f=2/(t-e),p=2/(n-s),u=-(t+e)/(t-e),d=-(n+s)/(n-s),x,M;if(l)x=1/(r-a),M=r/(r-a);else if(o===ln)x=-2/(r-a),M=-(r+a)/(r-a);else if(o===Pi)x=-1/(r-a),M=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=x,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};mr.prototype.isMatrix4=!0;var gt=mr,xi=new k,sn=new gt,qd=new k(0,0,0),Yd=new k(1,1,1),On=new k,da=new k,Yt=new k,jl=new gt,Ql=new Sn,Pn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],f=s[9],p=s[2],u=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(Ye(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ye(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(Ye(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-Ye(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(Ye(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Ye(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-f,d),this._y=0);break;default:Fe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return jl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ql.setFromEuler(this),this.setFromQuaternion(Ql,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Pn.DEFAULT_ORDER="XYZ";var vs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},$d=0,ec=new k,vi=new Sn,En=new gt,ha=new k,rs=new k,Zd=new k,Jd=new Sn,tc=new k(1,0,0),nc=new k(0,1,0),ic=new k(0,0,1),sc={type:"added"},Kd={type:"removed"},_i={type:"childadded",child:null},bo={type:"childremoved",child:null},Pt=class i extends bn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$d++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new k,t=new Pn,n=new Sn,s=new k(1,1,1);function a(){n.setFromEuler(t,!1)}function r(){t.setFromQuaternion(n,void 0,!1)}t._onChange(a),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new gt},normalMatrix:{value:new Ge}}),this.matrix=new gt,this.matrixWorld=new gt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.multiply(vi),this}rotateOnWorldAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.premultiply(vi),this}rotateX(e){return this.rotateOnAxis(tc,e)}rotateY(e){return this.rotateOnAxis(nc,e)}rotateZ(e){return this.rotateOnAxis(ic,e)}translateOnAxis(e,t){return ec.copy(e).applyQuaternion(this.quaternion),this.position.add(ec.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tc,e)}translateY(e){return this.translateOnAxis(nc,e)}translateZ(e){return this.translateOnAxis(ic,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(En.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ha.copy(e):ha.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?En.lookAt(rs,ha,this.up):En.lookAt(ha,rs,this.up),this.quaternion.setFromRotationMatrix(En),s&&(En.extractRotation(s.matrixWorld),vi.setFromRotationMatrix(En),this.quaternion.premultiply(vi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(sc),_i.child=e,this.dispatchEvent(_i),_i.child=null):ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kd),bo.child=e,this.dispatchEvent(bo),bo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),En.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),En.multiply(e.parent.matrixWorld)),e.applyMatrix4(En),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(sc),_i.child=e,this.dispatchEvent(_i),_i.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rs,e,Zd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rs,Jd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,a=this.matrix.elements;a[12]+=t-a[0]*t-a[4]*n-a[8]*s,a[13]+=n-a[1]*t-a[5]*n-a[9]*s,a[14]+=s-a[2]*t-a[6]*n-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){let p=l[c];a(e.shapes,p)}else a(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(e.materials,this.material[l]));s.material=o}else s.material=a(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(e.animations,l))}}if(t){let o=r(e.geometries),l=r(e.materials),c=r(e.textures),f=r(e.images),p=r(e.shapes),u=r(e.skeletons),d=r(e.animations),x=r(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),f.length>0&&(n.images=f),p.length>0&&(n.shapes=p),u.length>0&&(n.skeletons=u),d.length>0&&(n.animations=d),x.length>0&&(n.nodes=x)}return n.object=s,n;function r(o){let l=[];for(let c in o){let f=o[c];delete f.metadata,l.push(f)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Pt.DEFAULT_UP=new k(0,1,0);Pt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _n=class extends Pt{constructor(){super(),this.isGroup=!0,this.type="Group"}},jd={type:"move"},Ui=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _n,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _n,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _n,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){r=!0;for(let M of e.hand.values()){let m=t.getJointPose(M,n),h=this._getHandJoint(c,M);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}let f=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=f.position.distanceTo(p.position),d=.02,x=.005;c.inputState.pinching&&u>d+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=d-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,n),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(jd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new _n;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},sd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Bn={h:0,s:0,l:0},ua={h:0,s:0,l:0};function So(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var $e=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Je.workingColorSpace){if(e=Vd(e,1),t=Ye(t,0,1),n=Ye(n,0,1),t===0)this.r=this.g=this.b=n;else{let a=n<=.5?n*(1+t):n+t-n*t,r=2*n-a;this.r=So(r,a,e+1/3),this.g=So(r,a,e),this.b=So(r,a,e-1/3)}return Je.colorSpaceToWorking(this,s),this}setStyle(e,t=Bt){function n(a){a!==void 0&&parseFloat(a)<1&&Fe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:Fe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(r===6)return this.setHex(parseInt(a,16),t);Fe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bt){let n=sd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Fe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=In(e.r),this.g=In(e.g),this.b=In(e.b),this}copyLinearToSRGB(e){return this.r=Ri(e.r),this.g=Ri(e.g),this.b=Ri(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bt){return Je.workingToColorSpace(It.copy(this),e),Math.round(Ye(It.r*255,0,255))*65536+Math.round(Ye(It.g*255,0,255))*256+Math.round(Ye(It.b*255,0,255))}getHexString(e=Bt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.workingToColorSpace(It.copy(this),t);let n=It.r,s=It.g,a=It.b,r=Math.max(n,s,a),o=Math.min(n,s,a),l,c,f=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=f<=.5?p/(r+o):p/(2-r-o),r){case n:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-n)/p+2;break;case a:l=(n-s)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=f,e}getRGB(e,t=Je.workingColorSpace){return Je.workingToColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e=Bt){Je.workingToColorSpace(It.copy(this),e);let t=It.r,n=It.g,s=It.b;return e!==Bt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Bn),this.setHSL(Bn.h+e,Bn.s+t,Bn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Bn),e.getHSL(ua);let n=go(Bn.h,ua.h,t),s=go(Bn.s,ua.s,t),a=go(Bn.l,ua.l,t);return this.setHSL(n,s,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,a=e.elements;return this.r=a[0]*t+a[3]*n+a[6]*s,this.g=a[1]*t+a[4]*n+a[7]*s,this.b=a[2]*t+a[5]*n+a[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},It=new $e;$e.NAMES=sd;var _s=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new $e(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var ys=class extends Pt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pn,this.environmentIntensity=1,this.environmentRotation=new Pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},an=new k,An=new k,Mo=new k,Cn=new k,yi=new k,bi=new k,ac=new k,wo=new k,To=new k,Eo=new k,Ao=new xt,Co=new xt,Ro=new xt,Vn=class i{constructor(e=new k,t=new k,n=new k){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),an.subVectors(e,t),s.cross(an);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(e,t,n,s,a){an.subVectors(s,t),An.subVectors(n,t),Mo.subVectors(e,t);let r=an.dot(an),o=an.dot(An),l=an.dot(Mo),c=An.dot(An),f=An.dot(Mo),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let u=1/p,d=(c*l-o*f)*u,x=(r*f-o*l)*u;return a.set(1-d-x,x,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,n,s,a,r,o,l){return this.getBarycoord(e,t,n,s,Cn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Cn.x),l.addScaledVector(r,Cn.y),l.addScaledVector(o,Cn.z),l)}static getInterpolatedAttribute(e,t,n,s,a,r){return Ao.setScalar(0),Co.setScalar(0),Ro.setScalar(0),Ao.fromBufferAttribute(e,t),Co.fromBufferAttribute(e,n),Ro.fromBufferAttribute(e,s),r.setScalar(0),r.addScaledVector(Ao,a.x),r.addScaledVector(Co,a.y),r.addScaledVector(Ro,a.z),r}static isFrontFacing(e,t,n,s){return an.subVectors(n,t),An.subVectors(e,t),an.cross(An).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return an.subVectors(this.c,this.b),An.subVectors(this.a,this.b),an.cross(An).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,a){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,a)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,a=this.c,r,o;yi.subVectors(s,n),bi.subVectors(a,n),wo.subVectors(e,n);let l=yi.dot(wo),c=bi.dot(wo);if(l<=0&&c<=0)return t.copy(n);To.subVectors(e,s);let f=yi.dot(To),p=bi.dot(To);if(f>=0&&p<=f)return t.copy(s);let u=l*p-f*c;if(u<=0&&l>=0&&f<=0)return r=l/(l-f),t.copy(n).addScaledVector(yi,r);Eo.subVectors(e,a);let d=yi.dot(Eo),x=bi.dot(Eo);if(x>=0&&d<=x)return t.copy(a);let M=d*c-l*x;if(M<=0&&c>=0&&x<=0)return o=c/(c-x),t.copy(n).addScaledVector(bi,o);let m=f*x-d*p;if(m<=0&&p-f>=0&&d-x>=0)return ac.subVectors(a,s),o=(p-f)/(p-f+(d-x)),t.copy(s).addScaledVector(ac,o);let h=1/(m+M+u);return r=M*h,o=u*h,t.copy(n).addScaledVector(yi,r).addScaledVector(bi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Hn=class{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let a=n.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)e.isMesh===!0?e.getVertexPosition(r,rn):rn.fromBufferAttribute(a,r),rn.applyMatrix4(e.matrixWorld),this.expandByPoint(rn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fa.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),fa.copy(n.boundingBox)),fa.applyMatrix4(e.matrixWorld),this.union(fa)}let s=e.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,rn),rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(os),pa.subVectors(this.max,os),Si.subVectors(e.a,os),Mi.subVectors(e.b,os),wi.subVectors(e.c,os),kn.subVectors(Mi,Si),zn.subVectors(wi,Mi),ei.subVectors(Si,wi);let t=[0,-kn.z,kn.y,0,-zn.z,zn.y,0,-ei.z,ei.y,kn.z,0,-kn.x,zn.z,0,-zn.x,ei.z,0,-ei.x,-kn.y,kn.x,0,-zn.y,zn.x,0,-ei.y,ei.x,0];return!No(t,Si,Mi,wi,pa)||(t=[1,0,0,0,1,0,0,0,1],!No(t,Si,Mi,wi,pa))?!1:(ma.crossVectors(kn,zn),t=[ma.x,ma.y,ma.z],No(t,Si,Mi,wi,pa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Rn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Rn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Rn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Rn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Rn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Rn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Rn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Rn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Rn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Rn=[new k,new k,new k,new k,new k,new k,new k,new k],rn=new k,fa=new Hn,Si=new k,Mi=new k,wi=new k,kn=new k,zn=new k,ei=new k,os=new k,pa=new k,ma=new k,ti=new k;function No(i,e,t,n,s){for(let a=0,r=i.length-3;a<=r;a+=3){ti.fromArray(i,a);let o=s.x*Math.abs(ti.x)+s.y*Math.abs(ti.y)+s.z*Math.abs(ti.z),l=e.dot(ti),c=t.dot(ti),f=n.dot(ti);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}var St=new k,ga=new me,Qd=0,en=class extends bn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Qd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Qc,this.updateRanges=[],this.gpuType=hn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ga.fromBufferAttribute(this,t),ga.applyMatrix3(e),this.setXY(t,ga.x,ga.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=as(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Gt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=as(t,this.array)),t}setX(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=as(t,this.array)),t}setY(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=as(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=as(t,this.array)),t}setW(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,a){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array),a=Gt(a,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var bs=class extends en{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ss=class extends en{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var rt=class extends en{constructor(e,t,n){super(new Float32Array(e),t,n)}},eh=new Hn,ls=new k,Io=new k,Fi=class{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):eh.setFromPoints(e).getCenter(n);let s=0;for(let a=0,r=e.length;a<r;a++)s=Math.max(s,n.distanceToSquared(e[a]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ls.subVectors(e,this.center);let t=ls.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ls,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Io.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ls.copy(e.center).add(Io)),this.expandByPoint(ls.copy(e.center).sub(Io))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},th=0,Qt=new gt,Po=new Pt,Ti=new k,$t=new Hn,cs=new Hn,Tt=new k,Lt=class i extends bn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:th++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(zd(e)?Ss:bs)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let a=new Ge().getNormalMatrix(e);n.applyNormalMatrix(a),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Qt.makeRotationFromQuaternion(e),this.applyMatrix4(Qt),this}rotateX(e){return Qt.makeRotationX(e),this.applyMatrix4(Qt),this}rotateY(e){return Qt.makeRotationY(e),this.applyMatrix4(Qt),this}rotateZ(e){return Qt.makeRotationZ(e),this.applyMatrix4(Qt),this}translate(e,t,n){return Qt.makeTranslation(e,t,n),this.applyMatrix4(Qt),this}scale(e,t,n){return Qt.makeScale(e,t,n),this.applyMatrix4(Qt),this}lookAt(e){return Po.lookAt(e),Po.updateMatrix(),this.applyMatrix4(Po.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ti).negate(),this.translate(Ti.x,Ti.y,Ti.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,a=e.length;s<a;s++){let r=e[s];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new rt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let a=e[s];t.setXYZ(s,a.x,a.y,a.z||0)}e.length>t.count&&Fe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Hn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let a=t[n];$t.setFromBufferAttribute(a),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,$t.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,$t.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint($t.min),this.boundingBox.expandByPoint($t.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){let n=this.boundingSphere.center;if($t.setFromBufferAttribute(e),t)for(let a=0,r=t.length;a<r;a++){let o=t[a];cs.setFromBufferAttribute(o),this.morphTargetsRelative?(Tt.addVectors($t.min,cs.min),$t.expandByPoint(Tt),Tt.addVectors($t.max,cs.max),$t.expandByPoint(Tt)):($t.expandByPoint(cs.min),$t.expandByPoint(cs.max))}$t.getCenter(n);let s=0;for(let a=0,r=e.count;a<r;a++)Tt.fromBufferAttribute(e,a),s=Math.max(s,n.distanceToSquared(Tt));if(t)for(let a=0,r=t.length;a<r;a++){let o=t[a],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)Tt.fromBufferAttribute(o,c),l&&(Ti.fromBufferAttribute(e,c),Tt.add(Ti)),s=Math.max(s,n.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,a=t.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==n.count)&&(r=new en(new Float32Array(4*n.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let v=0;v<n.count;v++)o[v]=new k,l[v]=new k;let c=new k,f=new k,p=new k,u=new me,d=new me,x=new me,M=new k,m=new k;function h(v,T,C){c.fromBufferAttribute(n,v),f.fromBufferAttribute(n,T),p.fromBufferAttribute(n,C),u.fromBufferAttribute(a,v),d.fromBufferAttribute(a,T),x.fromBufferAttribute(a,C),f.sub(c),p.sub(c),d.sub(u),x.sub(u);let N=1/(d.x*x.y-x.x*d.y);isFinite(N)&&(M.copy(f).multiplyScalar(x.y).addScaledVector(p,-d.y).multiplyScalar(N),m.copy(p).multiplyScalar(d.x).addScaledVector(f,-x.x).multiplyScalar(N),o[v].add(M),o[T].add(M),o[C].add(M),l[v].add(m),l[T].add(m),l[C].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let v=0,T=S.length;v<T;++v){let C=S[v],N=C.start,L=C.count;for(let O=N,w=N+L;O<w;O+=3)h(e.getX(O+0),e.getX(O+1),e.getX(O+2))}let E=new k,y=new k,g=new k,_=new k;function R(v){g.fromBufferAttribute(s,v),_.copy(g);let T=o[v];E.copy(T),E.sub(g.multiplyScalar(g.dot(T))).normalize(),y.crossVectors(_,T);let N=y.dot(l[v])<0?-1:1;r.setXYZW(v,E.x,E.y,E.z,N)}for(let v=0,T=S.length;v<T;++v){let C=S[v],N=C.start,L=C.count;for(let O=N,w=N+L;O<w;O+=3)R(e.getX(O+0)),R(e.getX(O+1)),R(e.getX(O+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new en(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);let s=new k,a=new k,r=new k,o=new k,l=new k,c=new k,f=new k,p=new k;if(e)for(let u=0,d=e.count;u<d;u+=3){let x=e.getX(u+0),M=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,x),a.fromBufferAttribute(t,M),r.fromBufferAttribute(t,m),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,M),c.fromBufferAttribute(n,m),o.add(f),l.add(f),c.add(f),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(M,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=t.count;u<d;u+=3)s.fromBufferAttribute(t,u+0),a.fromBufferAttribute(t,u+1),r.fromBufferAttribute(t,u+2),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),n.setXYZ(u+0,f.x,f.y,f.z),n.setXYZ(u+1,f.x,f.y,f.z),n.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(o,l){let c=o.array,f=o.itemSize,p=o.normalized,u=new c.constructor(l.length*f),d=0,x=0;for(let M=0,m=l.length;M<m;M++){o.isInterleavedBufferAttribute?d=l[M]*o.data.stride+o.offset:d=l[M]*f;for(let h=0;h<f;h++)u[x++]=c[d++]}return new en(u,f,p)}if(this.index===null)return Fe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let f=0,p=c.length;f<p;f++){let u=c[f],d=e(u,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],f=[];for(let p=0,u=c.length;p<u;p++){let d=c[p];f.push(d.toJSON(e.data))}f.length>0&&(s[l]=f,a=!0)}a&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(e.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let f=s[c];this.setAttribute(c,f.clone(t))}let a=e.morphAttributes;for(let c in a){let f=[],p=a[c];for(let u=0,d=p.length;u<d;u++)f.push(p[u].clone(t));this.morphAttributes[c]=f}this.morphTargetsRelative=e.morphTargetsRelative;let r=e.groups;for(let c=0,f=r.length;c<f;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Lo=new k,nh=new k,ih=new Ge,on=class{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Lo.subVectors(n,t).cross(nh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Lo),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/a;return n===!0&&(r<0||r>1)?null:t.copy(e.start).addScaledVector(s,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ih.getNormalMatrix(e),s=this.coplanarPoint(Lo).applyMatrix4(e),a=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},sh=0,Wn=class extends bn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:sh++}),this.uuid=ji(),this.name="",this.type="Material",this.blending=Zi,this.side=Zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=il,this.blendDst=sl,this.blendEquation=oi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $e(0,0,0),this.blendAlpha=0,this.depthFunc=Ii,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Pa,this.stencilZFail=Pa,this.stencilZPass=Pa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Fe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Fe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(t){let a=s(e.textures),r=s(e.images);a.length>0&&(n.textures=a),r.length>0&&(n.images=r)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new $e().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new on().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new me().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new me().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let a=0;a!==s;++a)n[a]=t[a].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Nn=new k,Do=new k,xa=new k,va=new k,Ya=class{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Nn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Nn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Nn.copy(this.origin).addScaledVector(this.direction,t),Nn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Do.copy(e).add(t).multiplyScalar(.5),xa.copy(t).sub(e).normalize(),va.copy(this.origin).sub(Do);let a=e.distanceTo(t)*.5,r=-this.direction.dot(xa),o=va.dot(this.direction),l=-va.dot(xa),c=va.lengthSq(),f=Math.abs(1-r*r),p,u,d,x;if(f>0)if(p=r*l-o,u=r*o-l,x=a*f,p>=0)if(u>=-x)if(u<=x){let M=1/f;p*=M,u*=M,d=p*(p+r*u+2*o)+u*(r*p+u+2*l)+c}else u=a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u<=-x?(p=Math.max(0,-(-r*a+o)),u=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c):u<=x?(p=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(p=Math.max(0,-(r*a+o)),u=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c);else u=r>0?-a:a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Do).addScaledVector(xa,u),d}intersectSphere(e,t){if(e.radius<0)return null;Nn.subVectors(e.center,this.origin);let n=Nn.dot(this.direction),s=Nn.dot(Nn)-n*n,a=e.radius*e.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=n-r,l=n+r;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,a,r,o,l,c=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),f>=0?(a=(e.min.y-u.y)*f,r=(e.max.y-u.y)*f):(a=(e.max.y-u.y)*f,r=(e.min.y-u.y)*f),n>r||a>s||((a>n||isNaN(n))&&(n=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(e.min.z-u.z)*p,l=(e.max.z-u.z)*p):(o=(e.max.z-u.z)*p,l=(e.min.z-u.z)*p),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Nn)!==null}intersectTriangle(e,t,n,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,f=o.z,p=e.x-r.x,u=e.y-r.y,d=e.z-r.z,x=t.x-r.x,M=t.y-r.y,m=t.z-r.z,h=n.x-r.x,S=n.y-r.y,E=n.z-r.z,y=Math.abs(l),g=Math.abs(c),_=Math.abs(f),R,v,T,C,N,L,O,w,D,P,V,Z;if(y>=g&&y>=_?(T=l,L=p,D=x,Z=h,l>=0?(R=c,v=f,C=u,N=d,O=M,w=m,P=S,V=E):(R=f,v=c,C=d,N=u,O=m,w=M,P=E,V=S)):g>=_?(T=c,L=u,D=M,Z=S,c>=0?(R=f,v=l,C=d,N=p,O=m,w=x,P=E,V=h):(R=l,v=f,C=p,N=d,O=x,w=m,P=h,V=E)):(T=f,L=d,D=m,Z=E,f>=0?(R=l,v=c,C=p,N=u,O=x,w=M,P=h,V=S):(R=c,v=l,C=u,N=p,O=M,w=x,P=S,V=h)),T===0)return null;let H=R/T,B=v/T,F=1/T,re=C-H*L,ae=N-B*L,Ie=O-H*D,Me=w-B*D,Pe=P-H*Z,J=V-B*Z,te=Pe*Me-J*Ie,ge=re*J-ae*Pe,De=Ie*ae-Me*re;if(s){if(te<0||ge<0||De<0)return null}else if((te<0||ge<0||De<0)&&(te>0||ge>0||De>0))return null;let pe=te+ge+De;if(pe===0)return null;let Be=F*(te*L+ge*D+De*Z);return(pe>0?Be<0:Be>0)?null:this.at(Be/pe,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ms=class extends Wn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $e(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=al,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},rc=new gt,ni=new Ya,_a=new Fi,oc=new k,ya=new k,ba=new k,Sa=new k,Uo=new k,Ma=new k,lc=new k,wa=new k,Wt=class extends Pt{constructor(e=new Lt,t=new Ms){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,a=n.morphAttributes.position,r=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(a&&o){Ma.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let f=o[l],p=a[l];f!==0&&(Uo.fromBufferAttribute(p,e),r?Ma.addScaledVector(Uo,f):Ma.addScaledVector(Uo.sub(t),f))}t.add(Ma)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_a.copy(n.boundingSphere),_a.applyMatrix4(a),ni.copy(e.ray).recast(e.near),!(_a.containsPoint(ni.origin)===!1&&(ni.intersectSphere(_a,oc)===null||ni.origin.distanceToSquared(oc)>(e.far-e.near)**2))&&(rc.copy(a).invert(),ni.copy(e.ray).applyMatrix4(rc),!(n.boundingBox!==null&&ni.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ni)))}_computeIntersections(e,t,n){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,f=a.attributes.uv1,p=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let x=0,M=u.length;x<M;x++){let m=u[x],h=r[m.materialIndex],S=Math.max(m.start,d.start),E=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=S,g=E;y<g;y+=3){let _=o.getX(y),R=o.getX(y+1),v=o.getX(y+2);s=Ta(this,h,e,n,c,f,p,_,R,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,d.start),M=Math.min(o.count,d.start+d.count);for(let m=x,h=M;m<h;m+=3){let S=o.getX(m),E=o.getX(m+1),y=o.getX(m+2);s=Ta(this,r,e,n,c,f,p,S,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let x=0,M=u.length;x<M;x++){let m=u[x],h=r[m.materialIndex],S=Math.max(m.start,d.start),E=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=S,g=E;y<g;y+=3){let _=y,R=y+1,v=y+2;s=Ta(this,h,e,n,c,f,p,_,R,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,d.start),M=Math.min(l.count,d.start+d.count);for(let m=x,h=M;m<h;m+=3){let S=m,E=m+1,y=m+2;s=Ta(this,r,e,n,c,f,p,S,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function ah(i,e,t,n,s,a,r,o){let l;if(e.side===kt?l=n.intersectTriangle(r,a,s,!0,o):l=n.intersectTriangle(s,a,r,e.side===Zn,o),l===null)return null;wa.copy(o),wa.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(wa);return c<t.near||c>t.far?null:{distance:c,point:wa.clone(),object:i}}function Ta(i,e,t,n,s,a,r,o,l,c){i.getVertexPosition(o,ya),i.getVertexPosition(l,ba),i.getVertexPosition(c,Sa);let f=ah(i,e,t,n,ya,ba,Sa,lc);if(f){let p=new k;Vn.getBarycoord(lc,ya,ba,Sa,p),s&&(f.uv=Vn.getInterpolatedAttribute(s,o,l,c,p,new me)),a&&(f.uv1=Vn.getInterpolatedAttribute(a,o,l,c,p,new me)),r&&(f.normal=Vn.getInterpolatedAttribute(r,o,l,c,p,new k),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new k,materialIndex:0};Vn.getNormal(ya,ba,Sa,u.normal),f.face=u,f.barycoord=p}return f}var $a=class extends Vt{constructor(e=null,t=1,n=1,s,a,r,o,l,c=Et,f=Et,p,u){super(null,r,o,l,c,f,s,a,p,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ii=new Fi,rh=new me(.5,.5),Ea=new k,Oi=class{constructor(e=new on,t=new on,n=new on,s=new on,a=new on,r=new on){this.planes=[e,t,n,s,a,r]}set(e,t,n,s,a,r){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ln,n=!1){let s=this.planes,a=e.elements,r=a[0],o=a[1],l=a[2],c=a[3],f=a[4],p=a[5],u=a[6],d=a[7],x=a[8],M=a[9],m=a[10],h=a[11],S=a[12],E=a[13],y=a[14],g=a[15];if(s[0].setComponents(c-r,d-f,h-x,g-S).normalize(),s[1].setComponents(c+r,d+f,h+x,g+S).normalize(),s[2].setComponents(c+o,d+p,h+M,g+E).normalize(),s[3].setComponents(c-o,d-p,h-M,g-E).normalize(),n)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,d-u,h-m,g-y).normalize();else if(s[4].setComponents(c-l,d-u,h-m,g-y).normalize(),t===ln)s[5].setComponents(c+l,d+u,h+m,g+y).normalize();else if(t===Pi)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ii)}intersectsSprite(e){ii.center.set(0,0,0);let t=rh.distanceTo(e.center);return ii.radius=.7071067811865476+t,ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(ii)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Ea.x=s.normal.x>0?e.max.x:e.min.x,Ea.y=s.normal.y>0?e.max.y:e.min.y,Ea.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ea)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ws=class extends Vt{constructor(e=[],t=Jn,n,s,a,r,o,l,c,f){super(e,t,n,s,a,r,o,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Xn=class extends Vt{constructor(e,t,n=dn,s,a,r,o=Et,l=Et,c,f=yn,p=1){if(f!==yn&&f!==jn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:p};super(u,s,a,r,o,l,f,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Di(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Za=class extends Xn{constructor(e,t=dn,n=Jn,s,a,r=Et,o=Et,l,c=yn){let f={width:e,height:e,depth:1},p=[f,f,f,f,f,f];super(e,e,t,n,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ts=class extends Vt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Bi=class i extends Lt{constructor(e=1,t=1,n=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],f=[],p=[],u=0,d=0;x("z","y","x",-1,-1,n,t,e,r,a,0),x("z","y","x",1,-1,n,t,-e,r,a,1),x("x","z","y",1,1,e,n,t,s,r,2),x("x","z","y",1,-1,e,n,-t,s,r,3),x("x","y","z",1,-1,e,t,n,s,a,4),x("x","y","z",-1,-1,e,t,-n,s,a,5),this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(f,3)),this.setAttribute("uv",new rt(p,2));function x(M,m,h,S,E,y,g,_,R,v,T){let C=y/R,N=g/v,L=y/2,O=g/2,w=_/2,D=R+1,P=v+1,V=0,Z=0,H=new k;for(let B=0;B<P;B++){let F=B*N-O;for(let re=0;re<D;re++){let ae=re*C-L;H[M]=ae*S,H[m]=F*E,H[h]=w,c.push(H.x,H.y,H.z),H[M]=0,H[m]=0,H[h]=_>0?1:-1,f.push(H.x,H.y,H.z),p.push(re/R),p.push(1-B/v),V+=1}}for(let B=0;B<v;B++)for(let F=0;F<R;F++){let re=u+F+D*B,ae=u+F+D*(B+1),Ie=u+(F+1)+D*(B+1),Me=u+(F+1)+D*B;l.push(re,ae,Me),l.push(ae,Ie,Me),Z+=6}o.addGroup(d,Z,T),d+=Z,u+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var ai=class i extends Lt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let a=[],r=[],o=[],l=[],c=new k,f=new me;r.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let p=0,u=3;p<=t;p++,u+=3){let d=n+p/t*s;c.x=e*Math.cos(d),c.y=e*Math.sin(d),r.push(c.x,c.y,c.z),o.push(0,0,1),f.x=(r[u]/e+1)/2,f.y=(r[u+1]/e+1)/2,l.push(f.x,f.y)}for(let p=1;p<=t;p++)a.push(p,p+1,0);this.setIndex(a),this.setAttribute("position",new rt(r,3)),this.setAttribute("normal",new rt(o,3)),this.setAttribute("uv",new rt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},ki=class i extends Lt{constructor(e=1,t=1,n=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),a=Math.floor(a);let f=[],p=[],u=[],d=[],x=0,M=[],m=n/2,h=0;S(),r===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(f),this.setAttribute("position",new rt(p,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(d,2));function S(){let y=new k,g=new k,_=0,R=(t-e)/n;for(let v=0;v<=a;v++){let T=[],C=v/a,N=C*(t-e)+e;for(let L=0;L<=s;L++){let O=L/s,w=O*l+o,D=Math.sin(w),P=Math.cos(w);g.x=N*D,g.y=-C*n+m,g.z=N*P,p.push(g.x,g.y,g.z),y.set(D,R,P).normalize(),u.push(y.x,y.y,y.z),d.push(O,1-C),T.push(x++)}M.push(T)}for(let v=0;v<s;v++)for(let T=0;T<a;T++){let C=M[T][v],N=M[T+1][v],L=M[T+1][v+1],O=M[T][v+1];(e>0||T!==0)&&(f.push(C,N,O),_+=3),(t>0||T!==a-1)&&(f.push(N,L,O),_+=3)}c.addGroup(h,_,0),h+=_}function E(y){let g=x,_=new me,R=new k,v=0,T=y===!0?e:t,C=y===!0?1:-1;for(let L=1;L<=s;L++)p.push(0,m*C,0),u.push(0,C,0),d.push(.5,.5),x++;let N=x;for(let L=0;L<=s;L++){let w=L/s*l+o,D=Math.cos(w),P=Math.sin(w);R.x=T*P,R.y=m*C,R.z=T*D,p.push(R.x,R.y,R.z),u.push(0,C,0),_.x=D*.5+.5,_.y=P*.5*C+.5,d.push(_.x,_.y),x++}for(let L=0;L<s;L++){let O=g+L,w=N+L;y===!0?f.push(w,w+1,O):f.push(w+1,w,O),v+=3}c.addGroup(h,v,y===!0?1:2),h+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Zt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Fe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),a=0;t.push(0);for(let r=1;r<=e;r++)n=this.getPoint(r/e),a+=n.distanceTo(s),t.push(a),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,a=n.length,r;t?r=t:r=e*n[a-1];let o=0,l=a-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-r,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===r)return s/(a-1);let f=n[s],u=n[s+1]-f,d=(r-f)/u;return(s+d)/(a-1)}getTangent(e,t){let s=e-1e-4,a=e+1e-4;s<0&&(s=0),a>1&&(a=1);let r=this.getPoint(s),o=this.getPoint(a),l=t||(r.isVector2?new me:new k);return l.copy(o).sub(r).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new k,s=[],a=[],r=[],o=new k,l=new gt;for(let d=0;d<=e;d++){let x=d/e;s[d]=this.getTangentAt(x,new k)}a[0]=new k,r[0]=new k;let c=Number.MAX_VALUE,f=Math.abs(s[0].x),p=Math.abs(s[0].y),u=Math.abs(s[0].z);f<=c&&(c=f,n.set(1,0,0)),p<=c&&(c=p,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),a[0].crossVectors(s[0],o),r[0].crossVectors(s[0],a[0]);for(let d=1;d<=e;d++){if(a[d]=a[d-1].clone(),r[d]=r[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let x=Math.acos(Ye(s[d-1].dot(s[d]),-1,1));a[d].applyMatrix4(l.makeRotationAxis(o,x))}r[d].crossVectors(s[d],a[d])}if(t===!0){let d=Math.acos(Ye(a[0].dot(a[e]),-1,1));d/=e,s[0].dot(o.crossVectors(a[0],a[e]))>0&&(d=-d);for(let x=1;x<=e;x++)a[x].applyMatrix4(l.makeRotationAxis(s[x],d*x)),r[x].crossVectors(s[x],a[x])}return{tangents:s,normals:a,binormals:r}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},zi=class extends Zt{constructor(e=0,t=0,n=1,s=1,a=0,r=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=a,this.aEndAngle=r,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new me){let n=t,s=Math.PI*2,a=this.aEndAngle-this.aStartAngle,r=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=s;for(;a>s;)a-=s;a<Number.EPSILON&&(r?a=0:a=s),this.aClockwise===!0&&!r&&(a===s?a=-s:a=a-s);let o=this.aStartAngle+e*a,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let f=Math.cos(this.aRotation),p=Math.sin(this.aRotation),u=l-this.aX,d=c-this.aY;l=u*f-d*p+this.aX,c=u*p+d*f+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ja=class extends zi{constructor(e,t,n,s,a,r){super(e,t,n,n,s,a,r),this.isArcCurve=!0,this.type="ArcCurve"}};function Sl(){let i=0,e=0,t=0,n=0;function s(a,r,o,l){i=a,e=o,t=-3*a+3*r-2*o-l,n=2*a-2*r+o+l}return{initCatmullRom:function(a,r,o,l,c){s(r,o,c*(o-a),c*(l-r))},initNonuniformCatmullRom:function(a,r,o,l,c,f,p){let u=(r-a)/c-(o-a)/(c+f)+(o-r)/f,d=(o-r)/f-(l-r)/(f+p)+(l-o)/p;u*=f,d*=f,s(r,o,u,d)},calc:function(a){let r=a*a,o=r*a;return i+e*a+t*r+n*o}}}var cc=new k,dc=new k,Fo=new Sl,Oo=new Sl,Bo=new Sl,Gi=class extends Zt{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new k){let n=t,s=this.points,a=s.length,r=(a-(this.closed?0:1))*e,o=Math.floor(r),l=r-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/a)+1)*a:l===0&&o===a-1&&(o=a-2,l=1);let c,f;this.closed||o>0?c=s[(o-1)%a]:(dc.subVectors(s[0],s[1]).add(s[0]),c=dc);let p=s[o%a],u=s[(o+1)%a];if(this.closed||o+2<a?f=s[(o+2)%a]:(cc.subVectors(s[a-1],s[a-2]).add(s[a-1]),f=cc),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,x=Math.pow(c.distanceToSquared(p),d),M=Math.pow(p.distanceToSquared(u),d),m=Math.pow(u.distanceToSquared(f),d);M<1e-4&&(M=1),x<1e-4&&(x=M),m<1e-4&&(m=M),Fo.initNonuniformCatmullRom(c.x,p.x,u.x,f.x,x,M,m),Oo.initNonuniformCatmullRom(c.y,p.y,u.y,f.y,x,M,m),Bo.initNonuniformCatmullRom(c.z,p.z,u.z,f.z,x,M,m)}else this.curveType==="catmullrom"&&(Fo.initCatmullRom(c.x,p.x,u.x,f.x,this.tension),Oo.initCatmullRom(c.y,p.y,u.y,f.y,this.tension),Bo.initCatmullRom(c.z,p.z,u.z,f.z,this.tension));return n.set(Fo.calc(l),Oo.calc(l),Bo.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new k().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function hc(i,e,t,n,s){let a=(n-e)*.5,r=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+a+r)*l+(-3*t+3*n-2*a-r)*o+a*i+t}function oh(i,e){let t=1-i;return t*t*e}function lh(i,e){return 2*(1-i)*i*e}function ch(i,e){return i*i*e}function hs(i,e,t,n){return oh(i,e)+lh(i,t)+ch(i,n)}function dh(i,e){let t=1-i;return t*t*t*e}function hh(i,e){let t=1-i;return 3*t*t*i*e}function uh(i,e){return 3*(1-i)*i*i*e}function fh(i,e){return i*i*i*e}function us(i,e,t,n,s){return dh(i,e)+hh(i,t)+uh(i,n)+fh(i,s)}var Es=class extends Zt{constructor(e=new me,t=new me,n=new me,s=new me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new me){let n=t,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return n.set(us(e,s.x,a.x,r.x,o.x),us(e,s.y,a.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ka=class extends Zt{constructor(e=new k,t=new k,n=new k,s=new k){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new k){let n=t,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return n.set(us(e,s.x,a.x,r.x,o.x),us(e,s.y,a.y,r.y,o.y),us(e,s.z,a.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},As=class extends Zt{constructor(e=new me,t=new me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new me){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new me){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ja=class extends Zt{constructor(e=new k,t=new k){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new k){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new k){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Cs=class extends Zt{constructor(e=new me,t=new me,n=new me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new me){let n=t,s=this.v0,a=this.v1,r=this.v2;return n.set(hs(e,s.x,a.x,r.x),hs(e,s.y,a.y,r.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Rs=class extends Zt{constructor(e=new k,t=new k,n=new k){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new k){let n=t,s=this.v0,a=this.v1,r=this.v2;return n.set(hs(e,s.x,a.x,r.x),hs(e,s.y,a.y,r.y),hs(e,s.z,a.z,r.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ns=class extends Zt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new me){let n=t,s=this.points,a=(s.length-1)*e,r=Math.floor(a),o=a-r,l=s[r===0?r:r-1],c=s[r],f=s[r>s.length-2?s.length-1:r+1],p=s[r>s.length-3?s.length-1:r+2];return n.set(hc(o,l.x,c.x,f.x,p.x),hc(o,l.y,c.y,f.y,p.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new me().fromArray(s))}return this}},Xo=Object.freeze({__proto__:null,ArcCurve:Ja,CatmullRomCurve3:Gi,CubicBezierCurve:Es,CubicBezierCurve3:Ka,EllipseCurve:zi,LineCurve:As,LineCurve3:ja,QuadraticBezierCurve:Cs,QuadraticBezierCurve3:Rs,SplineCurve:Ns}),Qa=class extends Zt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Xo[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),a=0;for(;a<s.length;){if(s[a]>=n){let r=s[a]-n,o=this.curves[a],l=o.getLength(),c=l===0?0:1-r/l;return o.getPointAt(c,t)}a++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,a=this.curves;s<a.length;s++){let r=a[s],o=r.isEllipseCurve?e*2:r.isLineCurve||r.isLineCurve3?1:r.isSplineCurve?e*r.points.length:e,l=r.getPoints(o);for(let c=0;c<l.length;c++){let f=l[c];n&&n.equals(f)||(t.push(f),n=f)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Xo[s.type]().fromJSON(s))}return this}},Is=class extends Qa{constructor(e){super(),this.type="Path",this.currentPoint=new me,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new As(this.currentPoint.clone(),new me(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let a=new Cs(this.currentPoint.clone(),new me(e,t),new me(n,s));return this.curves.push(a),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,a,r){let o=new Es(this.currentPoint.clone(),new me(e,t),new me(n,s),new me(a,r));return this.curves.push(o),this.currentPoint.set(a,r),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Ns(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,a,r){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,a,r),this}absarc(e,t,n,s,a,r){return this.absellipse(e,t,n,n,s,a,r),this}ellipse(e,t,n,s,a,r,o,l){let c=this.currentPoint.x,f=this.currentPoint.y;return this.absellipse(e+c,t+f,n,s,a,r,o,l),this}absellipse(e,t,n,s,a,r,o,l){let c=new zi(e,t,n,s,a,r,o,l);if(this.curves.length>0){let p=c.getPoint(0);p.equals(this.currentPoint)||this.lineTo(p.x,p.y)}this.curves.push(c);let f=c.getPoint(1);return this.currentPoint.copy(f),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Vi=class extends Is{constructor(e){super(e),this.uuid=ji(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Is().fromJSON(s))}return this}};function ph(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,a=ad(i,0,s,t,!0),r=[];if(!a||a.next===a.prev)return r;let o,l,c;if(n&&(a=_h(i,e,a,t)),i.length>80*t){o=i[0],l=i[1];let f=o,p=l;for(let u=t;u<s;u+=t){let d=i[u],x=i[u+1];d<o&&(o=d),x<l&&(l=x),d>f&&(f=d),x>p&&(p=x)}c=Math.max(f-o,p-l),c=c!==0?32767/c:0}return Ps(a,r,t,o,l,c,0),r}function ad(i,e,t,n,s){let a;if(s===Nh(i,e,t,n)>0)for(let r=e;r<t;r+=n)a=uc(r/n|0,i[r],i[r+1],a);else for(let r=t-n;r>=e;r-=n)a=uc(r/n|0,i[r],i[r+1],a);return a&&Hi(a,a.next)&&(Ds(a),a=a.next),a}function ri(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Hi(t,t.next)||vt(t.prev,t,t.next)===0)){if(Ds(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Ps(i,e,t,n,s,a,r){if(!i)return;!r&&a&&wh(i,n,s,a);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(a?gh(i,n,s,a):mh(i)){e.push(l.i,i.i,c.i),Ds(i),i=c.next,o=c.next;continue}if(i=c,i===o){r?r===1?(i=xh(ri(i),e),Ps(i,e,t,n,s,a,2)):r===2&&vh(i,e,t,n,s,a):Ps(ri(i),e,t,n,s,a,1);break}}}function mh(i){let e=i.prev,t=i,n=i.next;if(vt(e,t,n)>=0)return!1;let s=e.x,a=t.x,r=n.x,o=e.y,l=t.y,c=n.y,f=Math.min(s,a,r),p=Math.min(o,l,c),u=Math.max(s,a,r),d=Math.max(o,l,c),x=n.next;for(;x!==e;){if(x.x>=f&&x.x<=u&&x.y>=p&&x.y<=d&&ds(s,o,a,l,r,c,x.x,x.y)&&vt(x.prev,x,x.next)>=0)return!1;x=x.next}return!0}function gh(i,e,t,n){let s=i.prev,a=i,r=i.next;if(vt(s,a,r)>=0)return!1;let o=s.x,l=a.x,c=r.x,f=s.y,p=a.y,u=r.y,d=Math.min(o,l,c),x=Math.min(f,p,u),M=Math.max(o,l,c),m=Math.max(f,p,u),h=qo(d,x,e,t,n),S=qo(M,m,e,t,n),E=i.prevZ,y=i.nextZ;for(;E&&E.z>=h&&y&&y.z<=S;){if(E.x>=d&&E.x<=M&&E.y>=x&&E.y<=m&&E!==s&&E!==r&&ds(o,f,l,p,c,u,E.x,E.y)&&vt(E.prev,E,E.next)>=0||(E=E.prevZ,y.x>=d&&y.x<=M&&y.y>=x&&y.y<=m&&y!==s&&y!==r&&ds(o,f,l,p,c,u,y.x,y.y)&&vt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;E&&E.z>=h;){if(E.x>=d&&E.x<=M&&E.y>=x&&E.y<=m&&E!==s&&E!==r&&ds(o,f,l,p,c,u,E.x,E.y)&&vt(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;y&&y.z<=S;){if(y.x>=d&&y.x<=M&&y.y>=x&&y.y<=m&&y!==s&&y!==r&&ds(o,f,l,p,c,u,y.x,y.y)&&vt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function xh(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Hi(n,s)&&od(n,t,t.next,s)&&Ls(n,s)&&Ls(s,n)&&(e.push(n.i,t.i,s.i),Ds(t),Ds(t.next),t=i=s),t=t.next}while(t!==i);return ri(t)}function vh(i,e,t,n,s,a){let r=i;do{let o=r.next.next;for(;o!==r.prev;){if(r.i!==o.i&&Ah(r,o)){let l=ld(r,o);r=ri(r,r.next),l=ri(l,l.next),Ps(r,e,t,n,s,a,0),Ps(l,e,t,n,s,a,0);return}o=o.next}r=r.next}while(r!==i)}function _h(i,e,t,n){let s=[];for(let a=0,r=e.length;a<r;a++){let o=e[a]*n,l=a<r-1?e[a+1]*n:i.length,c=ad(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Eh(c))}s.sort(yh);for(let a=0;a<s.length;a++)t=bh(s[a],t);return t}function yh(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function bh(i,e){let t=Sh(i,e);if(!t)return e;let n=ld(t,i);return ri(n,n.next),ri(t,t.next)}function Sh(i,e){let t=e,n=i.x,s=i.y,a=-1/0,r;if(Hi(i,t))return t;do{if(Hi(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let p=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=n&&p>a&&(a=p,r=t.x<t.next.x?t:t.next,p===n))return r}t=t.next}while(t!==e);if(!r)return null;let o=r,l=r.x,c=r.y,f=1/0;t=r;do{if(n>=t.x&&t.x>=l&&n!==t.x&&rd(s<c?n:a,s,l,c,s<c?a:n,s,t.x,t.y)){let p=Math.abs(s-t.y)/(n-t.x);Ls(t,i)&&(p<f||p===f&&(t.x>r.x||t.x===r.x&&Mh(r,t)))&&(r=t,f=p)}t=t.next}while(t!==o);return r}function Mh(i,e){return vt(i.prev,i,e.prev)<0&&vt(e.next,i,i.next)<0}function wh(i,e,t,n){let s=i;do s.z===0&&(s.z=qo(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Th(s)}function Th(i){let e,t=1;do{let n=i,s;i=null;let a=null;for(e=0;n;){e++;let r=n,o=0;for(let c=0;c<t&&(o++,r=r.nextZ,!!r);c++);let l=t;for(;o>0||l>0&&r;)o!==0&&(l===0||!r||n.z<=r.z)?(s=n,n=n.nextZ,o--):(s=r,r=r.nextZ,l--),a?a.nextZ=s:i=s,s.prevZ=a,a=s;n=r}a.nextZ=null,t*=2}while(e>1);return i}function qo(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Eh(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function rd(i,e,t,n,s,a,r,o){return(s-r)*(e-o)>=(i-r)*(a-o)&&(i-r)*(n-o)>=(t-r)*(e-o)&&(t-r)*(a-o)>=(s-r)*(n-o)}function ds(i,e,t,n,s,a,r,o){return!(i===r&&e===o)&&rd(i,e,t,n,s,a,r,o)}function Ah(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Ch(i,e)&&(Ls(i,e)&&Ls(e,i)&&Rh(i,e)&&(vt(i.prev,i,e.prev)||vt(i,e.prev,e))||Hi(i,e)&&vt(i.prev,i,i.next)>0&&vt(e.prev,e,e.next)>0)}function vt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Hi(i,e){return i.x===e.x&&i.y===e.y}function od(i,e,t,n){let s=Ca(vt(i,e,t)),a=Ca(vt(i,e,n)),r=Ca(vt(t,n,i)),o=Ca(vt(t,n,e));return!!(s!==a&&r!==o||s===0&&Aa(i,t,e)||a===0&&Aa(i,n,e)||r===0&&Aa(t,i,n)||o===0&&Aa(t,e,n))}function Aa(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ca(i){return i>0?1:i<0?-1:0}function Ch(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&od(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Ls(i,e){return vt(i.prev,i,i.next)<0?vt(i,e,i.next)>=0&&vt(i,i.prev,e)>=0:vt(i,e,i.prev)<0||vt(i,i.next,e)<0}function Rh(i,e){let t=i,n=!1,s=(i.x+e.x)/2,a=(i.y+e.y)/2;do t.y>a!=t.next.y>a&&t.next.y!==t.y&&s<(t.next.x-t.x)*(a-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function ld(i,e){let t=Yo(i.i,i.x,i.y),n=Yo(e.i,e.x,e.y),s=i.next,a=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,a.next=n,n.prev=a,n}function uc(i,e,t,n){let s=Yo(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ds(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Yo(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Nh(i,e,t,n){let s=0;for(let a=e,r=t-n;a<t;a+=n)s+=(i[r]-i[a])*(i[a+1]+i[r+1]),r=a;return s}var $o=class{static triangulate(e,t,n=2){return ph(e,t,n)}},Ni=class i{static area(e){let t=e.length,n=0;for(let s=t-1,a=0;a<t;s=a++)n+=e[s].x*e[a].y-e[a].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],a=[];fc(e),pc(n,e);let r=e.length;t.forEach(fc);for(let l=0;l<t.length;l++)s.push(r),r+=t[l].length,pc(n,t[l]);let o=$o.triangulate(n,s);for(let l=0;l<o.length;l+=3)a.push(o.slice(l,l+3));return a}};function fc(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function pc(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Us=class i extends Lt{constructor(e=[new me(0,-.5),new me(.5,0),new me(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=Ye(s,0,Math.PI*2);let a=[],r=[],o=[],l=[],c=[],f=1/t,p=new k,u=new me,d=new k,x=new k,M=new k,m=0,h=0;for(let S=0;S<=e.length-1;S++)switch(S){case 0:m=e[S+1].x-e[S].x,h=e[S+1].y-e[S].y,d.x=h*1,d.y=-m,d.z=h*0,M.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(M.x,M.y,M.z);break;default:m=e[S+1].x-e[S].x,h=e[S+1].y-e[S].y,d.x=h*1,d.y=-m,d.z=h*0,x.copy(d),d.x+=M.x,d.y+=M.y,d.z+=M.z,d.normalize(),l.push(d.x,d.y,d.z),M.copy(x)}for(let S=0;S<=t;S++){let E=n+S*f*s,y=Math.sin(E),g=Math.cos(E);for(let _=0;_<=e.length-1;_++){p.x=e[_].x*y,p.y=e[_].y,p.z=e[_].x*g,r.push(p.x,p.y,p.z),u.x=S/t,u.y=_/(e.length-1),o.push(u.x,u.y);let R=l[3*_+0]*y,v=l[3*_+1],T=l[3*_+0]*g;c.push(R,v,T)}}for(let S=0;S<t;S++)for(let E=0;E<e.length-1;E++){let y=E+S*e.length,g=y,_=y+e.length,R=y+e.length+1,v=y+1;a.push(g,_,v),a.push(R,v,_)}this.setIndex(a),this.setAttribute("position",new rt(r,3)),this.setAttribute("uv",new rt(o,2)),this.setAttribute("normal",new rt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var Fs=class i extends Lt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let a=e/2,r=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,f=l+1,p=e/o,u=t/l,d=[],x=[],M=[],m=[];for(let h=0;h<f;h++){let S=h*u-r;for(let E=0;E<c;E++){let y=E*p-a;x.push(y,-S,0),M.push(0,0,1),m.push(E/o),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let S=0;S<o;S++){let E=S+c*h,y=S+c*(h+1),g=S+1+c*(h+1),_=S+1+c*h;d.push(E,y,_),d.push(y,g,_)}this.setIndex(d),this.setAttribute("position",new rt(x,3)),this.setAttribute("normal",new rt(M,3)),this.setAttribute("uv",new rt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Os=class i extends Lt{constructor(e=new Vi([new me(0,.5),new me(-.5,-.5),new me(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],s=[],a=[],r=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let f=0;f<e.length;f++)c(e[f]),this.addGroup(o,l,f),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new rt(s,3)),this.setAttribute("normal",new rt(a,3)),this.setAttribute("uv",new rt(r,2));function c(f){let p=s.length/3,u=f.extractPoints(t),d=u.shape,x=u.holes;Ni.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,h=x.length;m<h;m++){let S=x[m];Ni.isClockWise(S)===!0&&(x[m]=S.reverse())}let M=Ni.triangulateShape(d,x);for(let m=0,h=x.length;m<h;m++){let S=x[m];d=d.concat(S)}for(let m=0,h=d.length;m<h;m++){let S=d[m];s.push(S.x,S.y,0),a.push(0,0,1),r.push(S.x,S.y)}for(let m=0,h=M.length;m<h;m++){let S=M[m],E=S[0]+p,y=S[1]+p,g=S[2]+p;n.push(E,y,g),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Ih(t,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let r=t[e.shapes[s]];n.push(r)}return new i(n,e.curveSegments)}};function Ih(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}var Wi=class i extends Lt{constructor(e=1,t=.4,n=12,s=48,a=Math.PI*2,r=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:a,thetaStart:r,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],f=[],p=[],u=new k,d=new k,x=new k;for(let M=0;M<=n;M++){let m=r+M/n*o;for(let h=0;h<=s;h++){let S=h/s*a;d.x=(e+t*Math.cos(m))*Math.cos(S),d.y=(e+t*Math.cos(m))*Math.sin(S),d.z=t*Math.sin(m),c.push(d.x,d.y,d.z),u.x=e*Math.cos(S),u.y=e*Math.sin(S),x.subVectors(d,u).normalize(),f.push(x.x,x.y,x.z),p.push(h/s),p.push(M/n)}}for(let M=1;M<=n;M++)for(let m=1;m<=s;m++){let h=(s+1)*M+m-1,S=(s+1)*(M-1)+m-1,E=(s+1)*(M-1)+m,y=(s+1)*M+m;l.push(h,S,y),l.push(S,E,y)}this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(f,3)),this.setAttribute("uv",new rt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var Bs=class i extends Lt{constructor(e=new Rs(new k(-1,-1,0),new k(-1,1,0),new k(1,1,0)),t=64,n=1,s=8,a=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:a};let r=e.computeFrenetFrames(t,a);this.tangents=r.tangents,this.normals=r.normals,this.binormals=r.binormals;let o=new k,l=new k,c=new me,f=new k,p=[],u=[],d=[],x=[];M(),this.setIndex(x),this.setAttribute("position",new rt(p,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(d,2));function M(){for(let E=0;E<t;E++)m(E);m(a===!1?t:0),S(),h()}function m(E){f=e.getPointAt(E/t,f);let y=r.normals[E],g=r.binormals[E];for(let _=0;_<=s;_++){let R=_/s*Math.PI*2,v=Math.sin(R),T=-Math.cos(R);l.x=T*y.x+v*g.x,l.y=T*y.y+v*g.y,l.z=T*y.z+v*g.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=f.x+n*l.x,o.y=f.y+n*l.y,o.z=f.z+n*l.z,p.push(o.x,o.y,o.z)}}function h(){for(let E=1;E<=t;E++)for(let y=1;y<=s;y++){let g=(s+1)*(E-1)+(y-1),_=(s+1)*E+(y-1),R=(s+1)*E+y,v=(s+1)*(E-1)+y;x.push(g,_,v),x.push(_,R,v)}}function S(){for(let E=0;E<=t;E++)for(let y=0;y<=s;y++)c.x=E/t,c.y=y/s,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Xo[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function ci(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(mc(s))s.isRenderTargetTexture?(Fe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(mc(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();e[t][n]=a}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ut(i){let e={};for(let t=0;t<i.length;t++){let n=ci(i[t]);for(let s in n)e[s]=n[s]}return e}function mc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Ph(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ml(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}var cd={clone:ci,merge:Ut},Lh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Jt=class extends Wn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Lh,this.fragmentShader=Dh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ci(e.uniforms),this.uniformsGroups=Ph(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?t.uniforms[s]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[s]={type:"m4",value:r.toArray()}:t.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new $e().setHex(s.value);break;case"v2":this.uniforms[n].value=new me().fromArray(s.value);break;case"v3":this.uniforms[n].value=new k().fromArray(s.value);break;case"v4":this.uniforms[n].value=new xt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ge().fromArray(s.value);break;case"m4":this.uniforms[n].value=new gt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},er=class extends Jt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ks=class extends Wn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new $e(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=no,this.normalScale=new me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var tr=class extends Wn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},nr=class extends Wn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ei(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ko(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var qn=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],a=t[n-1];n:{e:{let r;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<a)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(a=s,s=t[++n],e<s)break e}r=t.length;break t}if(!(e>=a)){let o=t[1];e<o&&(n=2,a=o);for(let l=n-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=a,a=t[--n-1],e>=a)break e}r=n,n=0;break t}break n}for(;n<r;){let o=n+r>>>1;e<t[o]?r=o:n=o+1}if(s=t[n],a=t[n-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,a,s)}return this.interpolate_(n,a,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,a=e*s;for(let r=0;r!==s;++r)t[r]=n[a+r];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ir=class extends qn{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Vo,endingEnd:Vo}}intervalChanged_(e,t,n){let s=this.parameterPositions,a=e-2,r=e+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Ho:a=e,o=2*t-n;break;case Wo:a=s.length-2,o=t+s[a]-s[a+1];break;default:a=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ho:r=e,l=2*n-t;break;case Wo:r=1,l=n+s[1]-s[0];break;default:r=e-1,l=t}let c=(n-t)*.5,f=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=a*f,this._offsetNext=r*f}interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,f=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,d=this._weightNext,x=(n-t)/(s-t),M=x*x,m=M*x,h=-u*m+2*u*M-u*x,S=(1+u)*m+(-1.5-2*u)*M+(-.5+u)*x+1,E=(-1-d)*m+(1.5+d)*M+.5*x,y=d*m-d*M;for(let g=0;g!==o;++g)a[g]=h*r[f+g]+S*r[c+g]+E*r[l+g]+y*r[p+g];return a}},sr=class extends qn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,f=(n-t)/(s-t),p=1-f;for(let u=0;u!==o;++u)a[u]=r[c+u]*p+r[l+u]*f;return a}},ar=class extends qn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},rr=class extends qn{interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,f=this.inTangents,p=this.outTangents;if(!f||!p){let x=(n-t)/(s-t),M=1-x;for(let m=0;m!==o;++m)a[m]=r[c+m]*M+r[l+m]*x;return a}let u=o*2,d=e-1;for(let x=0;x!==o;++x){let M=r[c+x],m=r[l+x],h=d*u+x*2,S=p[h],E=p[h+1],y=e*u+x*2,g=f[y],_=f[y+1],R=Fh(n,t,S,g,s);a[x]=dd(R,M,E,_,m)}return a}};function dd(i,e,t,n,s){let a=1-i;return a*a*a*e+3*a*a*i*t+3*a*i*i*n+i*i*i*s}function Uh(i,e,t,n,s){let a=1-i;return 3*a*a*(t-e)+6*a*i*(n-t)+3*i*i*(s-n)}function Fh(i,e,t,n,s){let a=(i-e)/(s-e);for(let r=0;r<8;r++){let o=dd(a,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Uh(a,e,t,n,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var Kt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ei(t,this.TimeBufferType),this.values=Ei(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ei(e.times,Array),values:Ei(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),ko(e.settings)&&(n.settings={inTangents:Ei(e.settings.inTangents,Array),outTangents:Ei(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ar(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new sr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ir(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new rr(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case fs:t=this.InterpolantFactoryMethodDiscrete;break;case Va:t=this.InterpolantFactoryMethodLinear;break;case Ia:t=this.InterpolantFactoryMethodSmooth;break;case Go:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Fe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return fs;case this.InterpolantFactoryMethodLinear:return Va;case this.InterpolantFactoryMethodSmooth:return Ia;case this.InterpolantFactoryMethodBezier:return Go}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;ko(this.settings)&&(gc(this.settings.inTangents,e),gc(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,a=0,r=s-1;for(;a!==s&&n[a]<e;)++a;for(;r!==-1&&n[r]>t;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=n.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,a=n.length;a===0&&(ke("KeyframeTrack: Track is empty.",this),e=!1);let r=null;for(let o=0;o!==a;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){ke("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(r!==null&&r>l){ke("KeyframeTrack: Out of order keys.",this,o,l,r),e=!1;break}r=l}if(s!==void 0&&Gd(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){ke("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ia,a=e.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=e[o],f=e[o+1];if(c!==f&&(o!==1||c!==e[0]))if(s)l=!0;else{let p=o*n,u=p-n,d=p+n;for(let x=0;x!==n;++x){let M=t[p+x];if(M!==t[u+x]||M!==t[d+x]){l=!0;break}}}if(l){if(o!==r){e[r]=e[o];let p=o*n,u=r*n;for(let d=0;d!==n;++d)t[u+d]=t[p+d]}++r}}if(a>0){e[r]=e[a];for(let o=a*n,l=r*n,c=0;c!==n;++c)t[l+c]=t[o+c];++r}return r!==e.length?(this.times=e.slice(0,r),this.values=t.slice(0,r*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,ko(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function gc(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Kt.prototype.ValueTypeName="";Kt.prototype.TimeBufferType=Float32Array;Kt.prototype.ValueBufferType=Float32Array;Kt.prototype.DefaultInterpolation=Va;var Yn=class extends Kt{constructor(e,t,n){super(e,t,n)}};Yn.prototype.ValueTypeName="bool";Yn.prototype.ValueBufferType=Array;Yn.prototype.DefaultInterpolation=fs;Yn.prototype.InterpolantFactoryMethodLinear=void 0;Yn.prototype.InterpolantFactoryMethodSmooth=void 0;var or=class extends Kt{constructor(e,t,n,s){super(e,t,n,s)}};or.prototype.ValueTypeName="color";var lr=class extends Kt{constructor(e,t,n,s){super(e,t,n,s)}};lr.prototype.ValueTypeName="number";var cr=class extends qn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let f=c+o;c!==f;c+=4)Sn.slerpFlat(a,0,r,c-o,r,c,l);return a}},zs=class extends Kt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new cr(this.times,this.values,this.getValueSize(),e)}};zs.prototype.ValueTypeName="quaternion";zs.prototype.InterpolantFactoryMethodSmooth=void 0;var $n=class extends Kt{constructor(e,t,n){super(e,t,n)}};$n.prototype.ValueTypeName="string";$n.prototype.ValueBufferType=Array;$n.prototype.DefaultInterpolation=fs;$n.prototype.InterpolantFactoryMethodLinear=void 0;$n.prototype.InterpolantFactoryMethodSmooth=void 0;var dr=class extends Kt{constructor(e,t,n,s){super(e,t,n,s)}};dr.prototype.ValueTypeName="vector";var hr=class{constructor(e,t,n){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(f){o++,a===!1&&s.onStart!==void 0&&s.onStart(f,r,o),a=!0},this.itemEnd=function(f){r++,s.onProgress!==void 0&&s.onProgress(f,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(f){s.onError!==void 0&&s.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,p){return c.push(f,p),this},this.removeHandler=function(f){let p=c.indexOf(f);return p!==-1&&c.splice(p,2),this},this.getHandler=function(f){for(let p=0,u=c.length;p<u;p+=2){let d=c[p],x=c[p+1];if(d.global&&(d.lastIndex=0),d.test(f))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},hd=new hr,ur=class{constructor(e){this.manager=e!==void 0?e:hd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,a){n.load(e,s,t,a)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ur.DEFAULT_MATERIAL_NAME="__DEFAULT";var Xi=class extends Pt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new $e(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Gs=class extends Xi{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Pt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new $e(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},zo=new gt,xc=new k,vc=new k,Vs=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new me(512,512),this.mapType=Xt,this.map=null,this.mapPass=null,this.matrix=new gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oi,this._frameExtents=new me(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;xc.setFromMatrixPosition(e.matrixWorld),t.position.copy(xc),vc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vc),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){zo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(zo,e.coordinateSystem,e.reversedDepth);let a=this._frameExtents,r=s?s.z/a.x:1,o=s?s.w/a.y:1,l=s?s.x/a.x:0,c=s?s.y/a.y:0;e.coordinateSystem===Pi||e.reversedDepth?t.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(zo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ra=new k,Na=new Sn,xn=new k,Hs=class extends Pt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new gt,this.projectionMatrix=new gt,this.projectionMatrixInverse=new gt,this.coordinateSystem=ln,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ra,Na,xn),xn.x===1&&xn.y===1&&xn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ra,Na,xn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ra,Na,xn),xn.x===1&&xn.y===1&&xn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ra,Na,xn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Gn=new k,_c=new me,yc=new me,At=class extends Hs{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ha*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(mo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ha*2*Math.atan(Math.tan(mo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Gn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Gn.x,Gn.y).multiplyScalar(-e/Gn.z),Gn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Gn.x,Gn.y).multiplyScalar(-e/Gn.z)}getViewSize(e,t){return this.getViewBounds(e,_c,yc),t.subVectors(yc,_c)}setViewOffset(e,t,n,s,a,r){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(mo*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,t-=r.offsetY*n/c,s*=r.width/l,n*=r.height/c}let o=this.filmOffset;o!==0&&(a+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Zo=class extends Vs{constructor(){super(new At(90,1,.5,500)),this.isPointLightShadow=!0}},Ws=class extends Xi{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Zo}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},qi=class extends Hs{constructor(e=-1,t=1,n=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=n-e,r=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Jo=class extends Vs{constructor(){super(new qi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Yi=class extends Xi{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Pt.DEFAULT_UP),this.updateMatrix(),this.target=new Pt,this.shadow=new Jo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Ai=-90,Ci=1,fr=class extends Pt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new At(Ai,Ci,e,t);s.layers=this.layers,this.add(s);let a=new At(Ai,Ci,e,t);a.layers=this.layers,this.add(a);let r=new At(Ai,Ci,e,t);r.layers=this.layers,this.add(r);let o=new At(Ai,Ci,e,t);o.layers=this.layers,this.add(o);let l=new At(Ai,Ci,e,t);l.layers=this.layers,this.add(l);let c=new At(Ai,Ci,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,a,r,o,l]=t;for(let c of t)this.remove(c);if(e===ln)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Pi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,f]=this.children,p=e.getRenderTarget(),u=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=M,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,f),e.setRenderTarget(p,u,d),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},pr=class extends At{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var wl="\\[\\]\\.:\\/",Oh=new RegExp("["+wl+"]","g"),Tl="[^"+wl+"]",Bh="[^"+wl.replace("\\.","")+"]",kh=/((?:WC+[\/:])*)/.source.replace("WC",Tl),zh=/(WCOD+)?/.source.replace("WCOD",Bh),Gh=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Tl),Vh=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Tl),Hh=new RegExp("^"+kh+zh+Gh+Vh+"$"),Wh=["material","materials","bones","map"],Ko=class{constructor(e,t,n){let s=n||pt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=n.length;s!==a;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},pt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Oh,"")}static parseTrackName(e){let t=Hh.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=n.nodeName.substring(s+1);Wh.indexOf(a)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=a)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,a=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Fe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let f=0;f<e.length;f++)if(e[f].name===c){c=f;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let r=e[s];if(r===void 0){let c=t.nodeName;ke("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[a]!==void 0&&(a=e.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};pt.Composite=Ko;pt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};pt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};pt.prototype.GetterByBindingType=[pt.prototype._getValue_direct,pt.prototype._getValue_array,pt.prototype._getValue_arrayElement,pt.prototype._getValue_toArray];pt.prototype.SetterByBindingTypeAndVersioning=[[pt.prototype._setValue_direct,pt.prototype._setValue_direct_setNeedsUpdate,pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_array,pt.prototype._setValue_array_setNeedsUpdate,pt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_arrayElement,pt.prototype._setValue_arrayElement_setNeedsUpdate,pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_fromArray,pt.prototype._setValue_fromArray_setNeedsUpdate,pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bg=new Float32Array(1);var Xs=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,Fe("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var Il=class Il{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let a=this.elements;return a[0]=e,a[2]=t,a[1]=n,a[3]=s,this}};Il.prototype.isMatrix2=!0;var jo=Il;function El(i,e,t,n){let s=Xh(n);switch(t){case xl:return i*e;case _l:return i*e/s.components*s.byteLength;case Mr:return i*e/s.components*s.byteLength;case Qn:return i*e*2/s.components*s.byteLength;case wr:return i*e*2/s.components*s.byteLength;case vl:return i*e*3/s.components*s.byteLength;case tn:return i*e*4/s.components*s.byteLength;case Tr:return i*e*4/s.components*s.byteLength;case Js:case Ks:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case js:case Qs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ar:case Rr:return Math.max(i,16)*Math.max(e,8)/4;case Er:case Cr:return Math.max(i,8)*Math.max(e,8)/2;case Nr:case Ir:case Lr:case Dr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Pr:case ea:case Ur:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Or:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Br:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case kr:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case zr:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Gr:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Vr:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Hr:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Wr:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Xr:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case qr:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Yr:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case $r:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Zr:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Jr:case Kr:case jr:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Qr:case eo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ta:case to:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Xh(i){switch(i){case Xt:case fl:return{byteLength:1,components:1};case Ji:case pl:case un:return{byteLength:2,components:1};case br:case Sr:return{byteLength:2,components:4};case dn:case yr:case hn:return{byteLength:4,components:1};case ml:case gl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Fe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Ld(){let i=null,e=!1,t=null,n=null;function s(a,r){n=i.requestAnimationFrame(s),t(a,r)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){i=a}}}function Yh(i){let e=new WeakMap;function t(o,l){let c=o.array,f=o.usage,p=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,f),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,l,c){let f=l.array,p=l.updateRanges;if(i.bindBuffer(c,o),p.length===0)i.bufferSubData(c,0,f);else{p.sort((d,x)=>d.start-x.start);let u=0;for(let d=1;d<p.length;d++){let x=p[u],M=p[d];M.start<=x.start+x.count+1?x.count=Math.max(x.count,M.start+M.count-x.start):(++u,p[u]=M)}p.length=u+1;for(let d=0,x=p.length;d<x;d++){let M=p[d];i.bufferSubData(c,M.start*f.BYTES_PER_ELEMENT,f,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let f=e.get(o);(!f||f.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var $h=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Zh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Jh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Kh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Qh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,eu=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,nu=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,iu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,su=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,au=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ru=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ou=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,lu=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,cu=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,du=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,hu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,uu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,fu=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,pu=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,mu=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,gu=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,xu=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,vu=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,_u=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,yu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,bu=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Su=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Mu=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,wu="gl_FragColor = linearToOutputTexel( gl_FragColor );",Tu=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Eu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Au=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Cu=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Ru=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Nu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Iu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Pu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Lu=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Du=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Uu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Fu=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ou=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Bu=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ku=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,zu=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Gu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Vu=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Hu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Wu=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Xu=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,qu=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Yu=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,$u=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Zu=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ju=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Ku=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ju=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Qu=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ef=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,tf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,nf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,sf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,af=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,of=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,lf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,cf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,df=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,uf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ff=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,pf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,mf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,vf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,_f=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,yf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,bf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Sf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Mf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,wf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Tf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ef=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Af=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Cf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Rf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Nf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,If=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Pf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Lf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Df=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Uf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ff=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Of=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Bf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,kf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Gf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Vf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Hf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Wf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Xf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,qf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Yf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,$f=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Zf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Jf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ep=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,np=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,ip=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,sp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,ap=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,rp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,op=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,dp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,up=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,pp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,gp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,xp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_p=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,yp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,wp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Tp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ep=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ap=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Cp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xe={alphahash_fragment:$h,alphahash_pars_fragment:Zh,alphamap_fragment:Jh,alphamap_pars_fragment:Kh,alphatest_fragment:jh,alphatest_pars_fragment:Qh,aomap_fragment:eu,aomap_pars_fragment:tu,batching_pars_vertex:nu,batching_vertex:iu,begin_vertex:su,beginnormal_vertex:au,bsdfs:ru,iridescence_fragment:ou,bumpmap_pars_fragment:lu,clipping_planes_fragment:cu,clipping_planes_pars_fragment:du,clipping_planes_pars_vertex:hu,clipping_planes_vertex:uu,color_fragment:fu,color_pars_fragment:pu,color_pars_vertex:mu,color_vertex:gu,common:xu,cube_uv_reflection_fragment:vu,defaultnormal_vertex:_u,displacementmap_pars_vertex:yu,displacementmap_vertex:bu,emissivemap_fragment:Su,emissivemap_pars_fragment:Mu,colorspace_fragment:wu,colorspace_pars_fragment:Tu,envmap_fragment:Eu,envmap_common_pars_fragment:Au,envmap_pars_fragment:Cu,envmap_pars_vertex:Ru,envmap_physical_pars_fragment:zu,envmap_vertex:Nu,fog_vertex:Iu,fog_pars_vertex:Pu,fog_fragment:Lu,fog_pars_fragment:Du,gradientmap_pars_fragment:Uu,lightmap_pars_fragment:Fu,lights_lambert_fragment:Ou,lights_lambert_pars_fragment:Bu,lights_pars_begin:ku,lights_toon_fragment:Gu,lights_toon_pars_fragment:Vu,lights_phong_fragment:Hu,lights_phong_pars_fragment:Wu,lights_physical_fragment:Xu,lights_physical_pars_fragment:qu,lights_fragment_begin:Yu,lights_fragment_maps:$u,lights_fragment_end:Zu,lightprobes_pars_fragment:Ju,logdepthbuf_fragment:Ku,logdepthbuf_pars_fragment:ju,logdepthbuf_pars_vertex:Qu,logdepthbuf_vertex:ef,map_fragment:tf,map_pars_fragment:nf,map_particle_fragment:sf,map_particle_pars_fragment:af,metalnessmap_fragment:rf,metalnessmap_pars_fragment:of,morphinstance_vertex:lf,morphcolor_vertex:cf,morphnormal_vertex:df,morphtarget_pars_vertex:hf,morphtarget_vertex:uf,normal_fragment_begin:ff,normal_fragment_maps:pf,normal_pars_fragment:mf,normal_pars_vertex:gf,normal_vertex:xf,normalmap_pars_fragment:vf,clearcoat_normal_fragment_begin:_f,clearcoat_normal_fragment_maps:yf,clearcoat_pars_fragment:bf,iridescence_pars_fragment:Sf,opaque_fragment:Mf,packing:wf,premultiplied_alpha_fragment:Tf,project_vertex:Ef,dithering_fragment:Af,dithering_pars_fragment:Cf,roughnessmap_fragment:Rf,roughnessmap_pars_fragment:Nf,shadowmap_pars_fragment:If,shadowmap_pars_vertex:Pf,shadowmap_vertex:Lf,shadowmask_pars_fragment:Df,skinbase_vertex:Uf,skinning_pars_vertex:Ff,skinning_vertex:Of,skinnormal_vertex:Bf,specularmap_fragment:kf,specularmap_pars_fragment:zf,tonemapping_fragment:Gf,tonemapping_pars_fragment:Vf,transmission_fragment:Hf,transmission_pars_fragment:Wf,uv_pars_fragment:Xf,uv_pars_vertex:qf,uv_vertex:Yf,worldpos_vertex:$f,background_vert:Zf,background_frag:Jf,backgroundCube_vert:Kf,backgroundCube_frag:jf,cube_vert:Qf,cube_frag:ep,depth_vert:tp,depth_frag:np,distance_vert:ip,distance_frag:sp,equirect_vert:ap,equirect_frag:rp,linedashed_vert:op,linedashed_frag:lp,meshbasic_vert:cp,meshbasic_frag:dp,meshlambert_vert:hp,meshlambert_frag:up,meshmatcap_vert:fp,meshmatcap_frag:pp,meshnormal_vert:mp,meshnormal_frag:gp,meshphong_vert:xp,meshphong_frag:vp,meshphysical_vert:_p,meshphysical_frag:yp,meshtoon_vert:bp,meshtoon_frag:Sp,points_vert:Mp,points_frag:wp,shadow_vert:Tp,shadow_frag:Ep,sprite_vert:Ap,sprite_frag:Cp},xe={common:{diffuse:{value:new $e(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $e(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new $e(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new $e(16777215)},opacity:{value:1},center:{value:new me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},Tn={basic:{uniforms:Ut([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Ut([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new $e(0)},envMapIntensity:{value:1}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Ut([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new $e(0)},specular:{value:new $e(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Ut([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new $e(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Ut([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new $e(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Ut([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Ut([xe.points,xe.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Ut([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Ut([xe.common,xe.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Ut([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Ut([xe.sprite,xe.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distance:{uniforms:Ut([xe.common,xe.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distance_vert,fragmentShader:Xe.distance_frag},shadow:{uniforms:Ut([xe.lights,xe.fog,{color:{value:new $e(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};Tn.physical={uniforms:Ut([Tn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new $e(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new $e(0)},specularColor:{value:new $e(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};var ao={r:0,b:0,g:0},Rp=new gt,Dd=new Ge;Dd.set(-1,0,0,0,1,0,0,0,1);function Np(i,e,t,n,s,a){let r=new $e(0),o=s===!0?0:1,l,c,f=null,p=0,u=null;function d(S){let E=S.isScene===!0?S.background:null;if(E&&E.isTexture){let y=S.backgroundBlurriness>0;E=e.get(E,y)}return E}function x(S){let E=!1,y=d(S);y===null?m(r,o):y&&y.isColor&&(m(y,1),E=!0);let g=i.xr.getEnvironmentBlendMode();g==="additive"?t.buffers.color.setClear(0,0,0,1,a):g==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,a),(i.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function M(S,E){let y=d(E);y&&(y.isCubeTexture||y.mapping===$s)?(c===void 0&&(c=new Wt(new Bi(1,1,1),new Jt({name:"BackgroundCubeMaterial",uniforms:ci(Tn.backgroundCube.uniforms),vertexShader:Tn.backgroundCube.vertexShader,fragmentShader:Tn.backgroundCube.fragmentShader,side:kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(g,_,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Rp.makeRotationFromEuler(E.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Dd),c.material.toneMapped=Je.getTransfer(y.colorSpace)!==at,(f!==y||p!==y.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,f=y,p=y.version,u=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Wt(new Fs(2,2),new Jt({name:"BackgroundMaterial",uniforms:ci(Tn.background.uniforms),vertexShader:Tn.background.vertexShader,fragmentShader:Tn.background.fragmentShader,side:Zn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=Je.getTransfer(y.colorSpace)!==at,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||p!==y.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,f=y,p=y.version,u=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function m(S,E){S.getRGB(ao,Ml(i)),t.buffers.color.setClear(ao.r,ao.g,ao.b,E,a)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(S,E=1){r.set(S),o=E,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,m(r,o)},render:x,addToRenderList:M,dispose:h}}function Ip(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),a=s,r=!1;function o(N,L,O,w,D){let P=!1,V=p(N,w,O,L);a!==V&&(a=V,c(a.object)),P=d(N,w,O,D),P&&x(N,w,O,D),D!==null&&e.update(D,i.ELEMENT_ARRAY_BUFFER),(P||r)&&(r=!1,y(N,L,O,w),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(D).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function f(N){return i.deleteVertexArray(N)}function p(N,L,O,w){let D=w.wireframe===!0,P=n[L.id];P===void 0&&(P={},n[L.id]=P);let V=N.isInstancedMesh===!0?N.id:0,Z=P[V];Z===void 0&&(Z={},P[V]=Z);let H=Z[O.id];H===void 0&&(H={},Z[O.id]=H);let B=H[D];return B===void 0&&(B=u(l()),H[D]=B),B}function u(N){let L=[],O=[],w=[];for(let D=0;D<t;D++)L[D]=0,O[D]=0,w[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:O,attributeDivisors:w,object:N,attributes:{},index:null}}function d(N,L,O,w){let D=a.attributes,P=L.attributes,V=0,Z=O.getAttributes();for(let H in Z)if(Z[H].location>=0){let F=D[H],re=P[H];if(re===void 0&&(H==="instanceMatrix"&&N.instanceMatrix&&(re=N.instanceMatrix),H==="instanceColor"&&N.instanceColor&&(re=N.instanceColor)),F===void 0||F.attribute!==re||re&&F.data!==re.data)return!0;V++}return a.attributesNum!==V||a.index!==w}function x(N,L,O,w){let D={},P=L.attributes,V=0,Z=O.getAttributes();for(let H in Z)if(Z[H].location>=0){let F=P[H];F===void 0&&(H==="instanceMatrix"&&N.instanceMatrix&&(F=N.instanceMatrix),H==="instanceColor"&&N.instanceColor&&(F=N.instanceColor));let re={};re.attribute=F,F&&F.data&&(re.data=F.data),D[H]=re,V++}a.attributes=D,a.attributesNum=V,a.index=w}function M(){let N=a.newAttributes;for(let L=0,O=N.length;L<O;L++)N[L]=0}function m(N){h(N,0)}function h(N,L){let O=a.newAttributes,w=a.enabledAttributes,D=a.attributeDivisors;O[N]=1,w[N]===0&&(i.enableVertexAttribArray(N),w[N]=1),D[N]!==L&&(i.vertexAttribDivisor(N,L),D[N]=L)}function S(){let N=a.newAttributes,L=a.enabledAttributes;for(let O=0,w=L.length;O<w;O++)L[O]!==N[O]&&(i.disableVertexAttribArray(O),L[O]=0)}function E(N,L,O,w,D,P,V){V===!0?i.vertexAttribIPointer(N,L,O,D,P):i.vertexAttribPointer(N,L,O,w,D,P)}function y(N,L,O,w){M();let D=w.attributes,P=O.getAttributes(),V=L.defaultAttributeValues;for(let Z in P){let H=P[Z];if(H.location>=0){let B=D[Z];if(B===void 0&&(Z==="instanceMatrix"&&N.instanceMatrix&&(B=N.instanceMatrix),Z==="instanceColor"&&N.instanceColor&&(B=N.instanceColor)),B!==void 0){let F=B.normalized,re=B.itemSize,ae=e.get(B);if(ae===void 0)continue;let Ie=ae.buffer,Me=ae.type,Pe=ae.bytesPerElement,J=Me===i.INT||Me===i.UNSIGNED_INT||B.gpuType===yr;if(B.isInterleavedBufferAttribute){let te=B.data,ge=te.stride,De=B.offset;if(te.isInstancedInterleavedBuffer){for(let pe=0;pe<H.locationSize;pe++)h(H.location+pe,te.meshPerAttribute);N.isInstancedMesh!==!0&&w._maxInstanceCount===void 0&&(w._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let pe=0;pe<H.locationSize;pe++)m(H.location+pe);i.bindBuffer(i.ARRAY_BUFFER,Ie);for(let pe=0;pe<H.locationSize;pe++)E(H.location+pe,re/H.locationSize,Me,F,ge*Pe,(De+re/H.locationSize*pe)*Pe,J)}else{if(B.isInstancedBufferAttribute){for(let te=0;te<H.locationSize;te++)h(H.location+te,B.meshPerAttribute);N.isInstancedMesh!==!0&&w._maxInstanceCount===void 0&&(w._maxInstanceCount=B.meshPerAttribute*B.count)}else for(let te=0;te<H.locationSize;te++)m(H.location+te);i.bindBuffer(i.ARRAY_BUFFER,Ie);for(let te=0;te<H.locationSize;te++)E(H.location+te,re/H.locationSize,Me,F,re*Pe,re/H.locationSize*te*Pe,J)}}else if(V!==void 0){let F=V[Z];if(F!==void 0)switch(F.length){case 2:i.vertexAttrib2fv(H.location,F);break;case 3:i.vertexAttrib3fv(H.location,F);break;case 4:i.vertexAttrib4fv(H.location,F);break;default:i.vertexAttrib1fv(H.location,F)}}}}S()}function g(){T();for(let N in n){let L=n[N];for(let O in L){let w=L[O];for(let D in w){let P=w[D];for(let V in P)f(P[V].object),delete P[V];delete w[D]}}delete n[N]}}function _(N){if(n[N.id]===void 0)return;let L=n[N.id];for(let O in L){let w=L[O];for(let D in w){let P=w[D];for(let V in P)f(P[V].object),delete P[V];delete w[D]}}delete n[N.id]}function R(N){for(let L in n){let O=n[L];for(let w in O){let D=O[w];if(D[N.id]===void 0)continue;let P=D[N.id];for(let V in P)f(P[V].object),delete P[V];delete D[N.id]}}}function v(N){for(let L in n){let O=n[L],w=N.isInstancedMesh===!0?N.id:0,D=O[w];if(D!==void 0){for(let P in D){let V=D[P];for(let Z in V)f(V[Z].object),delete V[Z];delete D[P]}delete O[w],Object.keys(O).length===0&&delete n[L]}}}function T(){C(),r=!0,a!==s&&(a=s,c(a.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:C,dispose:g,releaseStatesOfGeometry:_,releaseStatesOfObject:v,releaseStatesOfProgram:R,initAttributes:M,enableAttribute:m,disableUnusedAttributes:S}}function Pp(i,e,t){let n;function s(l){n=l}function a(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function r(l,c,f){f!==0&&(i.drawArraysInstanced(n,l,c,f),t.update(c,n,f))}function o(l,c,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,f);let u=0;for(let d=0;d<f;d++)u+=c[d];t.update(u,n,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function Lp(i,e,t,n){let s;function a(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(R){return!(R!==tn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let v=R===un&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Xt&&R!==hn&&!v&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",f=l(c);f!==c&&(Fe("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);let p=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Fe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),h=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),g=i.getParameter(i.MAX_SAMPLES),_=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:x,maxTextureSize:M,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:S,maxVaryings:E,maxFragmentUniforms:y,maxSamples:g,samples:_}}function Dp(i){let e=this,t=null,n=0,s=!1,a=!1,r=new on,o=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let d=p.length!==0||u||n!==0||s;return s=u,n=p.length,d},this.beginShadows=function(){a=!0,f(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){t=f(p,u,0)},this.setState=function(p,u,d){let x=p.clippingPlanes,M=p.clipIntersection,m=p.clipShadows,h=i.get(p);if(!s||x===null||x.length===0||a&&!m)a?f(null):c();else{let S=a?0:n,E=S*4,y=h.clippingState||null;l.value=y,y=f(x,u,E,d);for(let g=0;g!==E;++g)y[g]=t[g];h.clippingState=y,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function f(p,u,d,x){let M=p!==null?p.length:0,m=null;if(M!==0){if(m=l.value,x!==!0||m===null){let h=d+M*4,S=u.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<h)&&(m=new Float32Array(h));for(let E=0,y=d;E!==M;++E,y+=4)r.copy(p[E]).applyMatrix4(S,o),r.normal.toArray(m,y),m[y+3]=r.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,m}}var es=4,Up=6,Fp=20,Op=256,na=new qi,ud=new $e,Pl=null,Ll=0,Dl=0,Ul=!1,Bp=new k,di=new k,oo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,a={}){let{size:r=256,position:o=Bp}=a;Pl=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Ul=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=md(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Pl,Ll,Dl),this._renderer.xr.enabled=Ul,e.scissorTest=!1,Qi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Jn||e.mapping===li?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Pl=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Ul=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ct,minFilter:Ct,generateMipmaps:!1,type:un,format:tn,colorSpace:ps,depthBuffer:!1},s=fd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=fd(e,t,n);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=kp(a)),this._blurMaterial=Gp(a,e,t),this._ggxMaterial=zp(a,e,t)}return s}_compileMaterial(e){let t=new Wt(new Lt,e);this._renderer.compile(t,na)}_sceneToCubeUV(e,t,n,s,a){let l=new At(90,1,t,n),c=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,d=p.toneMapping;p.getClearColor(ud),p.toneMapping=cn,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Wt(new Bi,new Ms({name:"PMREM.Background",side:kt,depthWrite:!1,depthTest:!1})));let M=this._backgroundBox,m=M.material,h=!1,S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,h=!0):(m.color.copy(ud),h=!0);for(let E=0;E<6;E++){let y=E%3;y===0?(l.up.set(0,c[E],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+f[E],a.y,a.z)):y===1?(l.up.set(0,0,c[E]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+f[E],a.z)):(l.up.set(0,c[E],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+f[E]));let g=this._cubeSize;Qi(s,y*g,E>2?g:0,g,g),p.setRenderTarget(s),h&&p.render(M,l),p.render(e,l)}p.toneMapping=d,p.autoClear=u,e.background=S}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Jn||e.mapping===li;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=md()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pd());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=e;let l=this._cubeSize;Qi(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(r,na)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(e,a-1,a);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[n];o.material=r;let l=r.uniforms,c=n/(this._lodMeshes.length-1),f=t/(this._lodMeshes.length-1),p=Math.sqrt(c*c-f*f),u=c*1.25,d=p*u,{_lodMax:x}=this,M=this._sizeLods[n],m=3*M*(n>x-es?n-x+es:0),h=4*(this._cubeSize-M);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=x-t,Qi(a,m,h,3*M,2*M),s.setRenderTarget(a),s.render(o,na),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=x-n,Qi(e,m,h,3*M,2*M),s.setRenderTarget(e),s.render(o,na)}_blur(e,t,n,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,a,t,n,r),this._blurPass(a,e,n,n,r)}_blurPass(e,t,n,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-n;let f=this._sizeLods[s],p=3*f*(s>this._lodMax-es?s-this._lodMax+es:0),u=4*(this._cubeSize-f);Qi(t,p,u,3*f,2*f),r.setRenderTarget(t),r.render(l,na)}};function kp(i){let e=[],t=[],n=i,s=i-es+1+Up;for(let a=0;a<s;a++){let r=Math.pow(2,n);e.push(r);let o=1/(r-2),l=-o,c=1+o,f=[l,l,c,l,c,c,l,l,c,c,l,c],p=6,u=6,d=3,x=new Float32Array(d*u*p),M=new Float32Array(d*u*p);for(let h=0;h<p;h++){let S=h%3*2/3-1,E=h>2?0:-1,y=[S,E,0,S+2/3,E,0,S+2/3,E+1,0,S,E,0,S+2/3,E+1,0,S,E+1,0];x.set(y,d*u*h);for(let g=0;g<u;g++){let _=f[g*2]*2-1,R=f[g*2+1]*2-1;h===0?di.set(1,R,_):h===1?di.set(-_,1,-R):h===2?di.set(-_,R,1):h===3?di.set(-1,R,-_):h===4?di.set(-_,-1,R):di.set(_,R,-1),di.toArray(M,(h*u+g)*d)}}let m=new Lt;m.setAttribute("position",new en(x,d)),m.setAttribute("outputDirection",new en(M,d)),t.push(new Wt(m,null)),n>es&&n--}return{lodMeshes:t,sizeLods:e}}function fd(i,e,t){let n=new Ht(i,e,t);return n.texture.mapping=$s,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Qi(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function zp(i,e,t){return new Jt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Op,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ho(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function Gp(i,e,t){return new Jt({name:"SphericalGaussianBlur",defines:{SAMPLES:Fp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ho(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function pd(){return new Jt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function md(){return new Jt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function ho(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var lo=class extends Ht{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new ws(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Bi(5,5,5),a=new Jt({name:"CubemapFromEquirect",uniforms:ci(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:kt,blending:Mn});a.uniforms.tEquirect.value=t;let r=new Wt(s,a),o=t.minFilter;return t.minFilter===Kn&&(t.minFilter=Ct),new fr(1,10,this).update(e,r),t.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let a=e.getRenderTarget();for(let r=0;r<6;r++)e.setRenderTarget(this,r),e.clear(t,n,s);e.setRenderTarget(a)}};function Vp(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,d=!1){return u==null?null:d?r(u):a(u)}function a(u){if(u&&u.isTexture){let d=u.mapping;if(d===xr||d===vr)if(e.has(u)){let x=e.get(u).texture;return o(x,u.mapping)}else{let x=u.image;if(x&&x.height>0){let M=new lo(x.height);return M.fromEquirectangularTexture(i,u),e.set(u,M),u.addEventListener("dispose",c),o(M.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let d=u.mapping,x=d===xr||d===vr,M=d===Jn||d===li;if(x||M){let m=t.get(u),h=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return n===null&&(n=new oo(i)),m=x?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{let S=u.image;return x&&S&&S.height>0||M&&S&&l(S)?(n===null&&(n=new oo(i)),m=x?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",f),m.texture):null}}}return u}function o(u,d){return d===xr?u.mapping=Jn:d===vr&&(u.mapping=li),u}function l(u){let d=0,x=6;for(let M=0;M<x;M++)u[M]!==void 0&&d++;return d===x}function c(u){let d=u.target;d.removeEventListener("dispose",c);let x=e.get(d);x!==void 0&&(e.delete(d),x.dispose())}function f(u){let d=u.target;d.removeEventListener("dispose",f);let x=t.get(d);x!==void 0&&(t.delete(d),x.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:p}}function Hp(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&si("WebGLRenderer: "+n+" extension not supported."),s}}}function Wp(i,e,t,n){let s={},a=new WeakMap;function r(p){let u=p.target;u.index!==null&&e.remove(u.index);for(let x in u.attributes)e.remove(u.attributes[x]);u.removeEventListener("dispose",r),delete s[u.id];let d=a.get(u);d&&(e.remove(d),a.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,t.memory.geometries++),u}function l(p){let u=p.attributes;for(let d in u)e.update(u[d],i.ARRAY_BUFFER)}function c(p){let u=[],d=p.index,x=p.attributes.position,M=0;if(x===void 0)return;if(d!==null){let S=d.array;M=d.version;for(let E=0,y=S.length;E<y;E+=3){let g=S[E+0],_=S[E+1],R=S[E+2];u.push(g,_,_,R,R,g)}}else{let S=x.array;M=x.version;for(let E=0,y=S.length/3-1;E<y;E+=3){let g=E+0,_=E+1,R=E+2;u.push(g,_,_,R,R,g)}}let m=new(x.count>=65535?Ss:bs)(u,1);m.version=M;let h=a.get(p);h&&e.remove(h),a.set(p,m)}function f(p){let u=a.get(p);if(u){let d=p.index;d!==null&&u.version<d.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:f}}function Xp(i,e,t){let n;function s(p){n=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,u){i.drawElements(n,u,a,p*r),t.update(u,n,1)}function c(p,u,d){d!==0&&(i.drawElementsInstanced(n,u,a,p*r,d),t.update(u,n,d))}function f(p,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,a,p,0,d);let M=0;for(let m=0;m<d;m++)M+=u[m];t.update(M,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}function qp(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(a,r,o){switch(t.calls++,r){case i.TRIANGLES:t.triangles+=o*(a/3);break;case i.LINES:t.lines+=o*(a/2);break;case i.LINE_STRIP:t.lines+=o*(a-1);break;case i.LINE_LOOP:t.lines+=o*a;break;case i.POINTS:t.points+=o*a;break;default:ke("WebGLInfo: Unknown draw mode:",r);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Yp(i,e,t){let n=new WeakMap,s=new xt;function a(r,o,l){let c=r.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=f!==void 0?f.length:0,u=n.get(o);if(u===void 0||u.count!==p){let T=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],h=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],E=0;d===!0&&(E=1),x===!0&&(E=2),M===!0&&(E=3);let y=o.attributes.position.count*E,g=1;y>e.maxTextureSize&&(g=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let _=new Float32Array(y*g*4*p),R=new xs(_,y,g,p);R.type=hn,R.needsUpdate=!0;let v=E*4;for(let C=0;C<p;C++){let N=m[C],L=h[C],O=S[C],w=y*g*4*C;for(let D=0;D<N.count;D++){let P=D*v;d===!0&&(s.fromBufferAttribute(N,D),_[w+P+0]=s.x,_[w+P+1]=s.y,_[w+P+2]=s.z,_[w+P+3]=0),x===!0&&(s.fromBufferAttribute(L,D),_[w+P+4]=s.x,_[w+P+5]=s.y,_[w+P+6]=s.z,_[w+P+7]=0),M===!0&&(s.fromBufferAttribute(O,D),_[w+P+8]=s.x,_[w+P+9]=s.y,_[w+P+10]=s.z,_[w+P+11]=O.itemSize===4?s.w:1)}}u={count:p,texture:R,size:new me(y,g)},n.set(o,u),o.addEventListener("dispose",T)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",r.morphTexture,t);else{let d=0;for(let M=0;M<c.length;M++)d+=c[M];let x=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:a}}function $p(i,e,t,n,s){let a=new WeakMap;function r(c){let f=s.render.frame,p=c.geometry,u=e.get(c,p);if(a.get(u)!==f&&(e.update(u),a.set(u,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==f&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),a.set(c,f))),c.isSkinnedMesh){let d=c.skeleton;a.get(d)!==f&&(d.update(),a.set(d,f))}return u}function o(){a=new WeakMap}function l(c){let f=c.target;f.removeEventListener("dispose",l),n.releaseStatesOfObject(f),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:r,dispose:o}}var Zp={[rl]:"LINEAR_TONE_MAPPING",[ol]:"REINHARD_TONE_MAPPING",[ll]:"CINEON_TONE_MAPPING",[Ys]:"ACES_FILMIC_TONE_MAPPING",[dl]:"AGX_TONE_MAPPING",[hl]:"NEUTRAL_TONE_MAPPING",[cl]:"CUSTOM_TONE_MAPPING"};function Jp(i,e,t,n,s,a){let r=new Ht(e,t,{type:i,depthBuffer:s,stencilBuffer:a,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Lt;c.setAttribute("position",new rt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new rt([0,2,0,0,2,0],2));let f=new er({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),p=new Wt(c,f),u=new qi(-1,1,1,-1,0,1),d=null,x=null,M=!1,m,h=null,S=[],E=!1;this.setSize=function(y,g){r.setSize(y,g),o!==null&&o.setSize(y,g),l!==null&&l.setSize(y,g);for(let _=0;_<S.length;_++){let R=S[_];R.setSize&&R.setSize(y,g)}},this.setEffects=function(y){S=y,E=S.length>0&&S[0].isRenderPass===!0;let g=r.width,_=r.height;S.length>0&&o===null&&(o=new Ht(g,_,{type:un,depthBuffer:!1,stencilBuffer:!1}),l=new Ht(g,_,{type:un,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<S.length;R++){let v=S[R];v.setSize&&v.setSize(g,_)}},this.begin=function(y,g){if(M||y.toneMapping===cn&&S.length===0)return!1;if(h=g,g!==null){let _=g.width,R=g.height;(r.width!==_||r.height!==R)&&this.setSize(_,R)}return E===!1&&y.setRenderTarget(r),m=y.toneMapping,y.toneMapping=cn,!0},this.hasRenderPass=function(){return E},this.end=function(y,g){y.toneMapping=m,M=!0;let _=r,R=o;for(let v=0;v<S.length;v++){let T=S[v];T.enabled!==!1&&(T.render(y,R,_,g),T.needsSwap!==!1&&(_=R,R=R===o?l:o))}if(d!==y.outputColorSpace||x!==y.toneMapping){d=y.outputColorSpace,x=y.toneMapping,f.defines={},Je.getTransfer(d)===at&&(f.defines.SRGB_TRANSFER="");let v=Zp[x];v&&(f.defines[v]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=_.texture,y.setRenderTarget(h),y.render(p,u),h=null,M=!1},this.isCompositing=function(){return M},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),f.dispose()}}var Ud=new Vt,Bl=new Xn(1,1),Fd=new xs,Od=new qa,Bd=new ws,gd=[],xd=[],vd=new Float32Array(16),_d=new Float32Array(9),yd=new Float32Array(4);function ns(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,a=gd[s];if(a===void 0&&(a=new Float32Array(s),gd[s]=a),e!==0){n.toArray(a,0);for(let r=1,o=0;r!==e;++r)o+=t,i[r].toArray(a,o)}return a}function Mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function wt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function uo(i,e){let t=xd[e];t===void 0&&(t=new Int32Array(e),xd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Kp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function jp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2fv(this.addr,e),wt(t,e)}}function Qp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;i.uniform3fv(this.addr,e),wt(t,e)}}function em(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4fv(this.addr,e),wt(t,e)}}function tm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(Mt(t,n))return;yd.set(n),i.uniformMatrix2fv(this.addr,!1,yd),wt(t,n)}}function nm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(Mt(t,n))return;_d.set(n),i.uniformMatrix3fv(this.addr,!1,_d),wt(t,n)}}function im(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(Mt(t,n))return;vd.set(n),i.uniformMatrix4fv(this.addr,!1,vd),wt(t,n)}}function sm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function am(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2iv(this.addr,e),wt(t,e)}}function rm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3iv(this.addr,e),wt(t,e)}}function om(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4iv(this.addr,e),wt(t,e)}}function lm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function cm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2uiv(this.addr,e),wt(t,e)}}function dm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3uiv(this.addr,e),wt(t,e)}}function hm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4uiv(this.addr,e),wt(t,e)}}function um(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let a;this.type===i.SAMPLER_2D_SHADOW?(Bl.compareFunction=t.isReversedDepthBuffer()?so:io,a=Bl):a=Ud,t.setTexture2D(e||a,s)}function fm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Od,s)}function pm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Bd,s)}function mm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Fd,s)}function gm(i){switch(i){case 5126:return Kp;case 35664:return jp;case 35665:return Qp;case 35666:return em;case 35674:return tm;case 35675:return nm;case 35676:return im;case 5124:case 35670:return sm;case 35667:case 35671:return am;case 35668:case 35672:return rm;case 35669:case 35673:return om;case 5125:return lm;case 36294:return cm;case 36295:return dm;case 36296:return hm;case 35678:case 36198:case 36298:case 36306:case 35682:return um;case 35679:case 36299:case 36307:return fm;case 35680:case 36300:case 36308:case 36293:return pm;case 36289:case 36303:case 36311:case 36292:return mm}}function xm(i,e){i.uniform1fv(this.addr,e)}function vm(i,e){let t=ns(e,this.size,2);i.uniform2fv(this.addr,t)}function _m(i,e){let t=ns(e,this.size,3);i.uniform3fv(this.addr,t)}function ym(i,e){let t=ns(e,this.size,4);i.uniform4fv(this.addr,t)}function bm(i,e){let t=ns(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Sm(i,e){let t=ns(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Mm(i,e){let t=ns(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function wm(i,e){i.uniform1iv(this.addr,e)}function Tm(i,e){i.uniform2iv(this.addr,e)}function Em(i,e){i.uniform3iv(this.addr,e)}function Am(i,e){i.uniform4iv(this.addr,e)}function Cm(i,e){i.uniform1uiv(this.addr,e)}function Rm(i,e){i.uniform2uiv(this.addr,e)}function Nm(i,e){i.uniform3uiv(this.addr,e)}function Im(i,e){i.uniform4uiv(this.addr,e)}function Pm(i,e,t){let n=this.cache,s=e.length,a=uo(t,s);Mt(n,a)||(i.uniform1iv(this.addr,a),wt(n,a));let r;this.type===i.SAMPLER_2D_SHADOW?r=Bl:r=Ud;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||r,a[o])}function Lm(i,e,t){let n=this.cache,s=e.length,a=uo(t,s);Mt(n,a)||(i.uniform1iv(this.addr,a),wt(n,a));for(let r=0;r!==s;++r)t.setTexture3D(e[r]||Od,a[r])}function Dm(i,e,t){let n=this.cache,s=e.length,a=uo(t,s);Mt(n,a)||(i.uniform1iv(this.addr,a),wt(n,a));for(let r=0;r!==s;++r)t.setTextureCube(e[r]||Bd,a[r])}function Um(i,e,t){let n=this.cache,s=e.length,a=uo(t,s);Mt(n,a)||(i.uniform1iv(this.addr,a),wt(n,a));for(let r=0;r!==s;++r)t.setTexture2DArray(e[r]||Fd,a[r])}function Fm(i){switch(i){case 5126:return xm;case 35664:return vm;case 35665:return _m;case 35666:return ym;case 35674:return bm;case 35675:return Sm;case 35676:return Mm;case 5124:case 35670:return wm;case 35667:case 35671:return Tm;case 35668:case 35672:return Em;case 35669:case 35673:return Am;case 5125:return Cm;case 36294:return Rm;case 36295:return Nm;case 36296:return Im;case 35678:case 36198:case 36298:case 36306:case 35682:return Pm;case 35679:case 36299:case 36307:return Lm;case 35680:case 36300:case 36308:case 36293:return Dm;case 36289:case 36303:case 36311:case 36292:return Um}}var kl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=gm(t.type)}},zl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Fm(t.type)}},Gl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(e,t[o.id],n)}}},Fl=/(\w+)(\])?(\[|\.)?/g;function bd(i,e){i.seq.push(e),i.map[e.id]=e}function Om(i,e,t){let n=i.name,s=n.length;for(Fl.lastIndex=0;;){let a=Fl.exec(n),r=Fl.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){bd(t,c===void 0?new kl(o,i,e):new zl(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new Gl(o),bd(t,p)),t=p}}}var ts=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let o=e.getActiveUniform(t,r),l=e.getUniformLocation(t,o.name);Om(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===e.SAMPLER_2D_SHADOW||r.type===e.SAMPLER_CUBE_SHADOW||r.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(e,t,n,s){let a=this.map[t];a!==void 0&&a.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let a=0,r=t.length;a!==r;++a){let o=t[a],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,a=e.length;s!==a;++s){let r=e[s];r.id in t&&n.push(r)}return n}};function Sd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Bm=37297,km=0;function zm(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let r=s;r<a;r++){let o=r+1;n.push(`${o===e?">":" "} ${o}: ${t[r]}`)}return n.join(`
`)}var Md=new Ge;function Gm(i){Je._getMatrix(Md,Je.workingColorSpace,i);let e=`mat3( ${Md.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(i)){case ms:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return Fe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function wd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),a=(i.getShaderInfoLog(e)||"").trim();if(n&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+a+`

`+zm(i.getShaderSource(e),o)}else return a}function Vm(i,e){let t=Gm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Hm={[rl]:"Linear",[ol]:"Reinhard",[ll]:"Cineon",[Ys]:"ACESFilmic",[dl]:"AgX",[hl]:"Neutral",[cl]:"Custom"};function Wm(i,e){let t=Hm[e];return t===void 0?(Fe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ro=new k;function Xm(){Je.getLuminanceCoefficients(ro);let i=ro.x.toFixed(4),e=ro.y.toFixed(4),t=ro.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function qm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(sa).join(`
`)}function Ym(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function $m(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let a=i.getActiveAttrib(e,s),r=a.name,o=1;a.type===i.FLOAT_MAT2&&(o=2),a.type===i.FLOAT_MAT3&&(o=3),a.type===i.FLOAT_MAT4&&(o=4),t[r]={type:a.type,location:i.getAttribLocation(e,r),locationSize:o}}return t}function sa(i){return i!==""}function Td(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ed(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Zm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Vl(i){return i.replace(Zm,Km)}var Jm=new Map;function Km(i,e){let t=Xe[e];if(t===void 0){let n=Jm.get(e);if(n!==void 0)t=Xe[n],Fe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Vl(t)}var jm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ad(i){return i.replace(jm,Qm)}function Qm(i,e,t,n){let s="";for(let a=parseInt(e);a<parseInt(t);a++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function Cd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var eg={[qs]:"SHADOWMAP_TYPE_PCF",[$i]:"SHADOWMAP_TYPE_VSM"};function tg(i){return eg[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var ng={[Jn]:"ENVMAP_TYPE_CUBE",[li]:"ENVMAP_TYPE_CUBE",[$s]:"ENVMAP_TYPE_CUBE_UV"};function ig(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":ng[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var sg={[li]:"ENVMAP_MODE_REFRACTION"};function ag(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":sg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var rg={[al]:"ENVMAP_BLENDING_MULTIPLY",[Gc]:"ENVMAP_BLENDING_MIX",[Vc]:"ENVMAP_BLENDING_ADD"};function og(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":rg[i.combine]||"ENVMAP_BLENDING_NONE"}function lg(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function cg(i,e,t,n){let s=i.getContext(),a=t.defines,r=t.vertexShader,o=t.fragmentShader,l=tg(t),c=ig(t),f=ag(t),p=og(t),u=lg(t),d=qm(t),x=Ym(a),M=s.createProgram(),m,h,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(sa).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(sa).join(`
`),h.length>0&&(h+=`
`)):(m=[Cd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(sa).join(`
`),h=[Cd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+f:"",t.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==cn?"#define TONE_MAPPING":"",t.toneMapping!==cn?Xe.tonemapping_pars_fragment:"",t.toneMapping!==cn?Wm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,Vm("linearToOutputTexel",t.outputColorSpace),Xm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(sa).join(`
`)),r=Vl(r),r=Td(r,t),r=Ed(r,t),o=Vl(o),o=Td(o,t),o=Ed(o,t),r=Ad(r),o=Ad(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",t.glslVersion===yl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===yl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);let E=S+m+r,y=S+h+o,g=Sd(s,s.VERTEX_SHADER,E),_=Sd(s,s.FRAGMENT_SHADER,y);s.attachShader(M,g),s.attachShader(M,_),t.index0AttributeName!==void 0?s.bindAttribLocation(M,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(M,0,"position"),s.linkProgram(M);function R(N){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(M)||"",O=s.getShaderInfoLog(g)||"",w=s.getShaderInfoLog(_)||"",D=L.trim(),P=O.trim(),V=w.trim(),Z=!0,H=!0;if(s.getProgramParameter(M,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,M,g,_);else{let B=wd(s,g,"vertex"),F=wd(s,_,"fragment");ke("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(M,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+D+`
`+B+`
`+F)}else D!==""?Fe("WebGLProgram: Program Info Log:",D):(P===""||V==="")&&(H=!1);H&&(N.diagnostics={runnable:Z,programLog:D,vertexShader:{log:P,prefix:m},fragmentShader:{log:V,prefix:h}})}s.deleteShader(g),s.deleteShader(_),v=new ts(s,M),T=$m(s,M)}let v;this.getUniforms=function(){return v===void 0&&R(this),v};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(M,Bm)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=km++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=g,this.fragmentShader=_,this}var dg=0,Hl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Wl(e),t.set(e,n)),n}},Wl=class{constructor(e){this.id=dg++,this.code=e,this.usedTimes=0}};function hg(i){return i===Qn||i===ea||i===ta}function ug(i,e,t,n,s,a){let r=new vs,o=new Hl,l=new Set,c=[],f=new Map,p=n.logarithmicDepthBuffer,u=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){return l.add(v),v===0?"uv":`uv${v}`}function M(v,T,C,N,L,O){let w=N.fog,D=L.geometry,P=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?N.environment:null,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,Z=e.get(v.envMap||P,V),H=Z&&Z.mapping===$s?Z.image.height:null,B=d[v.type];v.precision!==null&&(u=n.getMaxPrecision(v.precision),u!==v.precision&&Fe("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));let F=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,re=F!==void 0?F.length:0,ae=0;D.morphAttributes.position!==void 0&&(ae=1),D.morphAttributes.normal!==void 0&&(ae=2),D.morphAttributes.color!==void 0&&(ae=3);let Ie,Me,Pe,J;if(B){let qe=Tn[B];Ie=qe.vertexShader,Me=qe.fragmentShader}else{Ie=v.vertexShader,Me=v.fragmentShader;let qe=o.getVertexShaderStage(v),ze=o.getFragmentShaderStage(v);o.update(v,qe,ze),Pe=qe.id,J=ze.id}let te=i.getRenderTarget(),ge=i.state.buffers.depth.getReversed(),De=L.isInstancedMesh===!0,pe=L.isBatchedMesh===!0,Be=!!v.map,ot=!!v.matcap,Ve=!!Z,He=!!v.aoMap,Qe=!!v.lightMap,Oe=!!v.bumpMap&&v.wireframe===!1,tt=!!v.normalMap,nt=!!v.displacementMap,_t=!!v.emissiveMap,Ke=!!v.metalnessMap,ye=!!v.roughnessMap,U=v.anisotropy>0,it=v.clearcoat>0,je=v.dispersion>0,I=v.retroreflectivity>0,b=v.iridescence>0,W=v.sheen>0,X=v.transmission>0,Q=U&&!!v.anisotropyMap,oe=it&&!!v.clearcoatMap,de=it&&!!v.clearcoatNormalMap,ee=it&&!!v.clearcoatRoughnessMap,ne=b&&!!v.iridescenceMap,le=b&&!!v.iridescenceThicknessMap,Ae=W&&!!v.sheenColorMap,fe=W&&!!v.sheenRoughnessMap,ue=!!v.specularMap,Ee=!!v.specularColorMap,Le=!!v.specularIntensityMap,Ue=X&&!!v.transmissionMap,z=X&&!!v.thicknessMap,j=!!v.gradientMap,q=!!v.alphaMap,se=v.alphaTest>0,he=!!v.alphaHash,ie=!!v.extensions,be=cn;v.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(be=i.toneMapping);let ce={shaderID:B,shaderType:v.type,shaderName:v.name,vertexShader:Ie,fragmentShader:Me,defines:v.defines,customVertexShaderID:Pe,customFragmentShaderID:J,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:pe,batchingColor:pe&&L._colorsTexture!==null,instancing:De,instancingColor:De&&L.instanceColor!==null,instancingMorph:De&&L.morphTexture!==null,outputColorSpace:te===null?i.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Je.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Be,matcap:ot,envMap:Ve,envMapMode:Ve&&Z.mapping,envMapCubeUVHeight:H,aoMap:He,lightMap:Qe,bumpMap:Oe,normalMap:tt,displacementMap:nt,emissiveMap:_t,normalMapObjectSpace:tt&&v.normalMapType===Xc,normalMapTangentSpace:tt&&v.normalMapType===no,packedNormalMap:tt&&v.normalMapType===no&&hg(v.normalMap.format),metalnessMap:Ke,roughnessMap:ye,anisotropy:U,anisotropyMap:Q,clearcoat:it,clearcoatMap:oe,clearcoatNormalMap:de,clearcoatRoughnessMap:ee,dispersion:je,retroreflection:I,iridescence:b,iridescenceMap:ne,iridescenceThicknessMap:le,sheen:W,sheenColorMap:Ae,sheenRoughnessMap:fe,specularMap:ue,specularColorMap:Ee,specularIntensityMap:Le,transmission:X,transmissionMap:Ue,thicknessMap:z,gradientMap:j,opaque:v.transparent===!1&&v.blending===Zi&&v.alphaToCoverage===!1,alphaMap:q,alphaTest:se,alphaHash:he,combine:v.combine,mapUv:Be&&x(v.map.channel),aoMapUv:He&&x(v.aoMap.channel),lightMapUv:Qe&&x(v.lightMap.channel),bumpMapUv:Oe&&x(v.bumpMap.channel),normalMapUv:tt&&x(v.normalMap.channel),displacementMapUv:nt&&x(v.displacementMap.channel),emissiveMapUv:_t&&x(v.emissiveMap.channel),metalnessMapUv:Ke&&x(v.metalnessMap.channel),roughnessMapUv:ye&&x(v.roughnessMap.channel),anisotropyMapUv:Q&&x(v.anisotropyMap.channel),clearcoatMapUv:oe&&x(v.clearcoatMap.channel),clearcoatNormalMapUv:de&&x(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ee&&x(v.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&x(v.iridescenceMap.channel),iridescenceThicknessMapUv:le&&x(v.iridescenceThicknessMap.channel),sheenColorMapUv:Ae&&x(v.sheenColorMap.channel),sheenRoughnessMapUv:fe&&x(v.sheenRoughnessMap.channel),specularMapUv:ue&&x(v.specularMap.channel),specularColorMapUv:Ee&&x(v.specularColorMap.channel),specularIntensityMapUv:Le&&x(v.specularIntensityMap.channel),transmissionMapUv:Ue&&x(v.transmissionMap.channel),thicknessMapUv:z&&x(v.thicknessMap.channel),alphaMapUv:q&&x(v.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(tt||U),vertexNormals:!!D.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!D.attributes.uv&&(Be||q),fog:!!w,useFog:v.fog===!0,fogExp2:!!w&&w.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||D.attributes.normal===void 0&&tt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:ge,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:ae,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:be,decodeVideoTexture:Be&&v.map.isVideoTexture===!0&&Je.getTransfer(v.map.colorSpace)===at,decodeVideoTextureEmissive:_t&&v.emissiveMap.isVideoTexture===!0&&Je.getTransfer(v.emissiveMap.colorSpace)===at,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Dt,flipSided:v.side===kt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ie&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&v.extensions.multiDraw===!0||pe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return ce.vertexUv1s=l.has(1),ce.vertexUv2s=l.has(2),ce.vertexUv3s=l.has(3),l.clear(),ce}function m(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let C in v.defines)T.push(C),T.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(h(T,v),S(T,v),T.push(i.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function h(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numSunLights),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numSunLightShadows),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function S(v,T){r.disableAll(),T.instancing&&r.enable(0),T.instancingColor&&r.enable(1),T.instancingMorph&&r.enable(2),T.matcap&&r.enable(3),T.envMap&&r.enable(4),T.normalMapObjectSpace&&r.enable(5),T.normalMapTangentSpace&&r.enable(6),T.clearcoat&&r.enable(7),T.iridescence&&r.enable(8),T.alphaTest&&r.enable(9),T.vertexColors&&r.enable(10),T.vertexAlphas&&r.enable(11),T.vertexUv1s&&r.enable(12),T.vertexUv2s&&r.enable(13),T.vertexUv3s&&r.enable(14),T.vertexTangents&&r.enable(15),T.anisotropy&&r.enable(16),T.alphaHash&&r.enable(17),T.batching&&r.enable(18),T.dispersion&&r.enable(19),T.retroreflection&&r.enable(24),T.batchingColor&&r.enable(20),T.gradientMap&&r.enable(21),T.packedNormalMap&&r.enable(22),T.vertexNormals&&r.enable(23),v.push(r.mask),r.disableAll(),T.fog&&r.enable(0),T.useFog&&r.enable(1),T.flatShading&&r.enable(2),T.logarithmicDepthBuffer&&r.enable(3),T.reversedDepthBuffer&&r.enable(4),T.skinning&&r.enable(5),T.morphTargets&&r.enable(6),T.morphNormals&&r.enable(7),T.morphColors&&r.enable(8),T.premultipliedAlpha&&r.enable(9),T.shadowMapEnabled&&r.enable(10),T.doubleSided&&r.enable(11),T.flipSided&&r.enable(12),T.useDepthPacking&&r.enable(13),T.dithering&&r.enable(14),T.transmission&&r.enable(15),T.sheen&&r.enable(16),T.opaque&&r.enable(17),T.pointsUvs&&r.enable(18),T.decodeVideoTexture&&r.enable(19),T.decodeVideoTextureEmissive&&r.enable(20),T.alphaToCoverage&&r.enable(21),T.numLightProbeGrids>0&&r.enable(22),T.hasPositionAttribute&&r.enable(23),v.push(r.mask)}function E(v){let T=d[v.type],C;if(T){let N=Tn[T];C=cd.clone(N.uniforms)}else C=v.uniforms;return C}function y(v,T){let C=f.get(T);return C!==void 0?++C.usedTimes:(C=new cg(i,T,v,s),c.push(C),f.set(T,C)),C}function g(v){if(--v.usedTimes===0){let T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),f.delete(v.cacheKey),v.destroy()}}function _(v){o.remove(v)}function R(){o.dispose()}return{getParameters:M,getProgramCacheKey:m,getUniforms:E,acquireProgram:y,releaseProgram:g,releaseShaderCache:_,programs:c,dispose:R}}function fg(){let i=new WeakMap;function e(r){return i.has(r)}function t(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function n(r){i.delete(r)}function s(r,o,l){i.get(r)[o]=l}function a(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:a}}function pg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Rd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Nd(){let i=[],e=0,t=[],n=[],s=[];function a(){e=0,t.length=0,n.length=0,s.length=0}function r(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,x,M,m,h){let S=i[e];return S===void 0?(S={id:u.id,object:u,geometry:d,material:x,materialVariant:r(u),groupOrder:M,renderOrder:u.renderOrder,z:m,group:h},i[e]=S):(S.id=u.id,S.object=u,S.geometry=d,S.material=x,S.materialVariant=r(u),S.groupOrder=M,S.renderOrder=u.renderOrder,S.z=m,S.group=h),e++,S}function l(u,d,x,M,m,h,S){S.reversedDepth===!0&&(m=-m);let E=o(u,d,x,M,m,h);x.transmission>0?n.push(E):x.transparent===!0?s.push(E):t.push(E)}function c(u,d,x,M,m,h){let S=o(u,d,x,M,m,h);x.transmission>0?n.unshift(S):x.transparent===!0?s.unshift(S):t.unshift(S)}function f(u,d){t.length>1&&t.sort(u||pg),n.length>1&&n.sort(d||Rd),s.length>1&&s.sort(d||Rd)}function p(){for(let u=e,d=i.length;u<d;u++){let x=i[u];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:s,init:a,push:l,unshift:c,finish:p,sort:f}}function mg(){let i=new WeakMap;function e(n,s){let a=i.get(n),r;return a===void 0?(r=new Nd,i.set(n,[r])):s>=a.length?(r=new Nd,a.push(r)):r=a[s],r}function t(){i=new WeakMap}return{get:e,dispose:t}}function gg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new k,color:new $e};break;case"SpotLight":t={position:new k,direction:new k,color:new $e,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new $e,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new $e,groundColor:new $e};break;case"RectAreaLight":t={color:new $e,position:new k,halfWidth:new k,halfHeight:new k};break}return i[e.id]=t,t}}}function xg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var vg=0;function _g(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function yg(i){let e=new gg,t=xg(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new k);let s=new k,a=new gt,r=new gt;function o(c){let f=0,p=0,u=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let d=0,x=0,M=0,m=0,h=0,S=0,E=0,y=0,g=0,_=0,R=0,v=0,T=0,C=0;c.sort(_g);for(let L=0,O=c.length;L<O;L++){let w=c[L],D=w.color,P=w.intensity,V=w.distance,Z=null;if(w.shadow&&w.shadow.map&&(w.shadow.map.texture.format===Qn?Z=w.shadow.map.texture:Z=w.shadow.map.depthTexture||w.shadow.map.texture),w.isAmbientLight)f+=D.r*P,p+=D.g*P,u+=D.b*P;else if(w.isLightProbe){for(let H=0;H<9;H++)n.probe[H].addScaledVector(w.sh.coefficients[H],P);C++}else if(w.isSunLight){let H=e.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){let B=w.shadow,F=t.get(w);F.shadowIntensity=B.intensity,F.shadowBias=B.bias,F.shadowNormalBias=B.normalBias,F.shadowRadius=B.radius,F.shadowMapSize.copy(B.mapSize).multiply(B.getFrameExtents()),n.sunShadow[x]=F,n.sunShadowMap[x]=Z;let re=B.getViewportCount();for(let ae=0;ae<re;ae++)n.sunShadowMatrix[M+ae]=B.getMatrix(ae),n.sunShadowCascade[M+ae]=B._cascadeData[ae];M+=re,x++}n.sun[d]=H,d++}else if(w.isDirectionalLight){let H=e.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){let B=w.shadow,F=t.get(w);F.shadowIntensity=B.intensity,F.shadowBias=B.bias,F.shadowNormalBias=B.normalBias,F.shadowRadius=B.radius,F.shadowMapSize=B.mapSize,n.directionalShadow[m]=F,n.directionalShadowMap[m]=Z,n.directionalShadowMatrix[m]=w.shadow.matrix,g++}n.directional[m]=H,m++}else if(w.isSpotLight){let H=e.get(w);H.position.setFromMatrixPosition(w.matrixWorld),H.color.copy(D).multiplyScalar(P),H.distance=V,H.coneCos=Math.cos(w.angle),H.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),H.decay=w.decay,n.spot[S]=H;let B=w.shadow;if(w.map&&(n.spotLightMap[v]=w.map,v++,B.updateMatrices(w),w.castShadow&&T++),n.spotLightMatrix[S]=B.matrix,w.castShadow){let F=t.get(w);F.shadowIntensity=B.intensity,F.shadowBias=B.bias,F.shadowNormalBias=B.normalBias,F.shadowRadius=B.radius,F.shadowMapSize=B.mapSize,n.spotShadow[S]=F,n.spotShadowMap[S]=Z,R++}S++}else if(w.isRectAreaLight){let H=e.get(w);H.color.copy(D).multiplyScalar(P),H.halfWidth.set(w.width*.5,0,0),H.halfHeight.set(0,w.height*.5,0),n.rectArea[E]=H,E++}else if(w.isPointLight){let H=e.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),H.distance=w.distance,H.decay=w.decay,w.castShadow){let B=w.shadow,F=t.get(w);F.shadowIntensity=B.intensity,F.shadowBias=B.bias,F.shadowNormalBias=B.normalBias,F.shadowRadius=B.radius,F.shadowMapSize=B.mapSize,F.shadowCameraNear=B.camera.near,F.shadowCameraFar=B.camera.far,n.pointShadow[h]=F,n.pointShadowMap[h]=Z,n.pointShadowMatrix[h]=w.shadow.matrix,_++}n.point[h]=H,h++}else if(w.isHemisphereLight){let H=e.get(w);H.skyColor.copy(w.color).multiplyScalar(P),H.groundColor.copy(w.groundColor).multiplyScalar(P),n.hemi[y]=H,y++}}E>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=xe.LTC_FLOAT_1,n.rectAreaLTC2=xe.LTC_FLOAT_2):(n.rectAreaLTC1=xe.LTC_HALF_1,n.rectAreaLTC2=xe.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=p,n.ambient[2]=u;let N=n.hash;(N.sunLength!==d||N.directionalLength!==m||N.pointLength!==h||N.spotLength!==S||N.rectAreaLength!==E||N.hemiLength!==y||N.numSunShadows!==x||N.numDirectionalShadows!==g||N.numPointShadows!==_||N.numSpotShadows!==R||N.numSpotMaps!==v||N.numLightProbes!==C)&&(n.sun.length=d,n.directional.length=m,n.spot.length=S,n.rectArea.length=E,n.point.length=h,n.hemi.length=y,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=M,n.sunShadowCascade.length=M,n.directionalShadow.length=g,n.directionalShadowMap.length=g,n.directionalShadowMatrix.length=g,n.pointShadow.length=_,n.pointShadowMap.length=_,n.pointShadowMatrix.length=_,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+v-T,n.spotLightMap.length=v,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=C,N.sunLength=d,N.directionalLength=m,N.pointLength=h,N.spotLength=S,N.rectAreaLength=E,N.hemiLength=y,N.numSunShadows=x,N.numDirectionalShadows=g,N.numPointShadows=_,N.numSpotShadows=R,N.numSpotMaps=v,N.numLightProbes=C,n.version=vg++)}function l(c,f){let p=0,u=0,d=0,x=0,M=0,m=0,h=f.matrixWorldInverse;for(let S=0,E=c.length;S<E;S++){let y=c[S];if(y.isSunLight){let g=n.sun[p];g.direction.setFromMatrixPosition(y.matrixWorld),g.direction.transformDirection(h),p++}else if(y.isDirectionalLight){let g=n.directional[u];g.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),g.direction.sub(s),g.direction.transformDirection(h),u++}else if(y.isSpotLight){let g=n.spot[x];g.position.setFromMatrixPosition(y.matrixWorld),g.position.applyMatrix4(h),g.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),g.direction.sub(s),g.direction.transformDirection(h),x++}else if(y.isRectAreaLight){let g=n.rectArea[M];g.position.setFromMatrixPosition(y.matrixWorld),g.position.applyMatrix4(h),r.identity(),a.copy(y.matrixWorld),a.premultiply(h),r.extractRotation(a),g.halfWidth.set(y.width*.5,0,0),g.halfHeight.set(0,y.height*.5,0),g.halfWidth.applyMatrix4(r),g.halfHeight.applyMatrix4(r),M++}else if(y.isPointLight){let g=n.point[d];g.position.setFromMatrixPosition(y.matrixWorld),g.position.applyMatrix4(h),d++}else if(y.isHemisphereLight){let g=n.hemi[m];g.direction.setFromMatrixPosition(y.matrixWorld),g.direction.transformDirection(h),m++}}}return{setup:o,setupView:l,state:n}}function Id(i){let e=new yg(i),t=[],n=[],s=[];function a(u){p.camera=u,t.length=0,n.length=0,s.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function f(u){e.setupView(t,u)}let p={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:f,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function bg(i){let e=new WeakMap;function t(s,a=0){let r=e.get(s),o;return r===void 0?(o=new Id(i),e.set(s,[o])):a>=r.length?(o=new Id(i),r.push(o)):o=r[a],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Sg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Mg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,wg=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],Tg=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],Pd=new gt,ia=new k,Ol=new k;function Eg(i,e,t){let n=new Oi,s=new me,a=new me,r=new xt,o=new tr,l=new nr,c={},f=t.maxTextureSize,p={[Zn]:kt,[kt]:Zn,[Dt]:Dt},u=new Jt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new me},radius:{value:4}},vertexShader:Sg,fragmentShader:Mg}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let x=new Lt;x.setAttribute("position",new en(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let M=new Wt(x,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=qs;let h=this.type;this.render=function(_,R,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||_.length===0)return;this.type===gr&&(Fe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=qs);let T=i.getRenderTarget(),C=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Mn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let O=h!==this.type;O&&R.traverse(function(w){w.material&&(Array.isArray(w.material)?w.material.forEach(D=>D.needsUpdate=!0):w.material.needsUpdate=!0)});for(let w=0,D=_.length;w<D;w++){let P=_[w],V=P.shadow;if(V===void 0){Fe("WebGLShadowMap:",P,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let Z=V.getFrameExtents();s.multiply(Z),a.copy(V.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(a.x=Math.floor(f/Z.x),s.x=a.x*Z.x,V.mapSize.x=a.x),s.y>f&&(a.y=Math.floor(f/Z.y),s.y=a.y*Z.y,V.mapSize.y=a.y));let H=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=H,V.map===null||O===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===$i){if(P.isPointLight){Fe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new Ht(s.x,s.y,{format:Qn,type:un,minFilter:Ct,magFilter:Ct,generateMipmaps:!1}),V.map.texture.name=P.name+".shadowMap",V.map.depthTexture=new Xn(s.x,s.y,hn),V.map.depthTexture.name=P.name+".shadowMapDepth",V.map.depthTexture.format=yn,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Et,V.map.depthTexture.magFilter=Et}else P.isPointLight?(V.map=new lo(s.x),V.map.depthTexture=new Za(s.x,dn)):(V.map=new Ht(s.x,s.y),V.map.depthTexture=new Xn(s.x,s.y,dn)),V.map.depthTexture.name=P.name+".shadowMap",V.map.depthTexture.format=yn,this.type===qs?(V.map.depthTexture.compareFunction=H?so:io,V.map.depthTexture.minFilter=Ct,V.map.depthTexture.magFilter=Ct):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Et,V.map.depthTexture.magFilter=Et);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let B=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();P.isPointLight!==!0&&V.updateMatrices(P,v);for(let F=0;F<B;F++){let re=V.getCamera(F);if(P.isPointLight){let ae=V.camera,Ie=V.matrix,Me=P.distance||ae.far;Me!==ae.far&&(ae.far=Me,ae.updateProjectionMatrix()),ia.setFromMatrixPosition(P.matrixWorld),ae.position.copy(ia),Ol.copy(ae.position),Ol.add(wg[F]),ae.up.copy(Tg[F]),ae.lookAt(Ol),ae.updateMatrixWorld(),Ie.makeTranslation(-ia.x,-ia.y,-ia.z),Pd.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Pd,ae.coordinateSystem,ae.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,F),i.clear();else{F===0&&(i.setRenderTarget(V.map),i.clear());let ae=V.getViewport(F);r.set(a.x*ae.x,a.y*ae.y,a.x*ae.z,a.y*ae.w),L.viewport(r)}n=V.getFrustum(F),y(R,v,re,P,this.type)}V.isPointLightShadow!==!0&&this.type===$i&&S(V,v),V.needsUpdate=!1}h=this.type,m.needsUpdate=!1,i.setRenderTarget(T,C,N)};function S(_,R){let v=e.update(M);u.defines.VSM_SAMPLES!==_.blurSamples&&(u.defines.VSM_SAMPLES=_.blurSamples,d.defines.VSM_SAMPLES=_.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),_.mapPass===null?_.mapPass=new Ht(s.x,s.y,{format:Qn,type:un}):(_.mapPass.width!==_.map.width||_.mapPass.height!==_.map.height)&&_.mapPass.setSize(_.map.width,_.map.height),u.uniforms.shadow_pass.value=_.map.depthTexture,u.uniforms.resolution.value.set(_.map.width,_.map.height),u.uniforms.radius.value=_.radius,i.setRenderTarget(_.mapPass),i.clear(),i.renderBufferDirect(R,null,v,u,M,null),d.uniforms.shadow_pass.value=_.mapPass.texture,d.uniforms.resolution.value.set(_.map.width,_.map.height),d.uniforms.radius.value=_.radius,i.setRenderTarget(_.map),i.clear(),i.renderBufferDirect(R,null,v,d,M,null)}function E(_,R,v,T){let C=null,N=v.isPointLight===!0?_.customDistanceMaterial:_.customDepthMaterial;if(N!==void 0)C=N;else if(C=v.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let L=C.uuid,O=R.uuid,w=c[L];w===void 0&&(w={},c[L]=w);let D=w[O];D===void 0&&(D=C.clone(),w[O]=D,R.addEventListener("dispose",g)),C=D}if(C.visible=R.visible,C.wireframe=R.wireframe,T===$i?C.side=R.shadowSide!==null?R.shadowSide:R.side:C.side=R.shadowSide!==null?R.shadowSide:p[R.side],C.alphaMap=R.alphaMap,C.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,C.map=R.map,C.clipShadows=R.clipShadows,C.clippingPlanes=R.clippingPlanes,C.clipIntersection=R.clipIntersection,C.displacementMap=R.displacementMap,C.displacementScale=R.displacementScale,C.displacementBias=R.displacementBias,C.wireframeLinewidth=R.wireframeLinewidth,C.linewidth=R.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let L=i.properties.get(C);L.light=v}return C}function y(_,R,v,T,C){if(_.visible===!1)return;if(_.layers.test(R.layers)&&(_.isMesh||_.isLine||_.isPoints)&&(_.castShadow||_.receiveShadow&&C===$i)&&(!_.frustumCulled||_.intersectsFrustum(n))){_.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,_.matrixWorld);let O=e.update(_),w=_.material;if(Array.isArray(w)){let D=O.groups;for(let P=0,V=D.length;P<V;P++){let Z=D[P],H=w[Z.materialIndex];if(H&&H.visible){let B=E(_,H,T,C);_.onBeforeShadow(i,_,R,v,O,B,Z),i.renderBufferDirect(v,null,O,B,_,Z),_.onAfterShadow(i,_,R,v,O,B,Z)}}}else if(w.visible){let D=E(_,w,T,C);_.onBeforeShadow(i,_,R,v,O,D,null),i.renderBufferDirect(v,null,O,D,_,null),_.onAfterShadow(i,_,R,v,O,D,null)}}let L=_.children;for(let O=0,w=L.length;O<w;O++)y(L[O],R,v,T,C)}function g(_){_.target.removeEventListener("dispose",g);for(let v in c){let T=c[v],C=_.target.uuid;C in T&&(T[C].dispose(),delete T[C])}}}function Ag(i,e){function t(){let z=!1,j=new xt,q=null,se=new xt(0,0,0,0);return{setMask:function(he){q!==he&&!z&&(i.colorMask(he,he,he,he),q=he)},setLocked:function(he){z=he},setClear:function(he,ie,be,ce,qe){qe===!0&&(he*=ce,ie*=ce,be*=ce),j.set(he,ie,be,ce),se.equals(j)===!1&&(i.clearColor(he,ie,be,ce),se.copy(j))},reset:function(){z=!1,q=null,se.set(-1,0,0,0)}}}function n(){let z=!1,j=!1,q=null,se=null,he=null;return{setReversed:function(ie){if(j!==ie){let be=e.get("EXT_clip_control");ie?be.clipControlEXT(be.LOWER_LEFT_EXT,be.ZERO_TO_ONE_EXT):be.clipControlEXT(be.LOWER_LEFT_EXT,be.NEGATIVE_ONE_TO_ONE_EXT),j=ie;let ce=he;he=null,this.setClear(ce)}},getReversed:function(){return j},setTest:function(ie){ie?te(i.DEPTH_TEST):ge(i.DEPTH_TEST)},setMask:function(ie){q!==ie&&!z&&(i.depthMask(ie),q=ie)},setFunc:function(ie){if(j&&(ie=id[ie]),se!==ie){switch(ie){case La:i.depthFunc(i.NEVER);break;case Da:i.depthFunc(i.ALWAYS);break;case Ua:i.depthFunc(i.LESS);break;case Ii:i.depthFunc(i.LEQUAL);break;case Fa:i.depthFunc(i.EQUAL);break;case Oa:i.depthFunc(i.GEQUAL);break;case Ba:i.depthFunc(i.GREATER);break;case ka:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}se=ie}},setLocked:function(ie){z=ie},setClear:function(ie){he!==ie&&(he=ie,j&&(ie=1-ie),i.clearDepth(ie))},reset:function(){z=!1,q=null,se=null,he=null,j=!1}}}function s(){let z=!1,j=null,q=null,se=null,he=null,ie=null,be=null,ce=null,qe=null;return{setTest:function(ze){z||(ze?te(i.STENCIL_TEST):ge(i.STENCIL_TEST))},setMask:function(ze){j!==ze&&!z&&(i.stencilMask(ze),j=ze)},setFunc:function(ze,lt,mt){(q!==ze||se!==lt||he!==mt)&&(i.stencilFunc(ze,lt,mt),q=ze,se=lt,he=mt)},setOp:function(ze,lt,mt){(ie!==ze||be!==lt||ce!==mt)&&(i.stencilOp(ze,lt,mt),ie=ze,be=lt,ce=mt)},setLocked:function(ze){z=ze},setClear:function(ze){qe!==ze&&(i.clearStencil(ze),qe=ze)},reset:function(){z=!1,j=null,q=null,se=null,he=null,ie=null,be=null,ce=null,qe=null}}}let a=new t,r=new n,o=new s,l=new WeakMap,c=new WeakMap,f={},p={},u={},d=new WeakMap,x=[],M=null,m=!1,h=null,S=null,E=null,y=null,g=null,_=null,R=null,v=new $e(0,0,0),T=0,C=!1,N=null,L=null,O=null,w=null,D=null,P=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,Z=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(H)[1]),V=Z>=1):H.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),V=Z>=2);let B=null,F={},re=i.getParameter(i.SCISSOR_BOX),ae=i.getParameter(i.VIEWPORT),Ie=new xt().fromArray(re),Me=new xt().fromArray(ae);function Pe(z,j,q,se){let he=new Uint8Array(4),ie=i.createTexture();i.bindTexture(z,ie),i.texParameteri(z,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(z,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let be=0;be<q;be++)z===i.TEXTURE_3D||z===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,se,0,i.RGBA,i.UNSIGNED_BYTE,he):i.texImage2D(j+be,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,he);return ie}let J={};J[i.TEXTURE_2D]=Pe(i.TEXTURE_2D,i.TEXTURE_2D,1),J[i.TEXTURE_CUBE_MAP]=Pe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[i.TEXTURE_2D_ARRAY]=Pe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),J[i.TEXTURE_3D]=Pe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),te(i.DEPTH_TEST),r.setFunc(Ii),Oe(!1),tt(Qo),te(i.CULL_FACE),He(Mn);function te(z){f[z]!==!0&&(i.enable(z),f[z]=!0)}function ge(z){f[z]!==!1&&(i.disable(z),f[z]=!1)}function De(z,j){return u[z]!==j?(i.bindFramebuffer(z,j),u[z]=j,z===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=j),z===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=j),!0):!1}function pe(z,j){let q=x,se=!1;if(z){q=d.get(j),q===void 0&&(q=[],d.set(j,q));let he=z.textures;if(q.length!==he.length||q[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,be=he.length;ie<be;ie++)q[ie]=i.COLOR_ATTACHMENT0+ie;q.length=he.length,se=!0}}else q[0]!==i.BACK&&(q[0]=i.BACK,se=!0);se&&i.drawBuffers(q)}function Be(z){return M!==z?(i.useProgram(z),M=z,!0):!1}let ot={[oi]:i.FUNC_ADD,[wc]:i.FUNC_SUBTRACT,[Tc]:i.FUNC_REVERSE_SUBTRACT};ot[Ec]=i.MIN,ot[Ac]=i.MAX;let Ve={[Cc]:i.ZERO,[Rc]:i.ONE,[Nc]:i.SRC_COLOR,[il]:i.SRC_ALPHA,[Fc]:i.SRC_ALPHA_SATURATE,[Dc]:i.DST_COLOR,[Pc]:i.DST_ALPHA,[Ic]:i.ONE_MINUS_SRC_COLOR,[sl]:i.ONE_MINUS_SRC_ALPHA,[Uc]:i.ONE_MINUS_DST_COLOR,[Lc]:i.ONE_MINUS_DST_ALPHA,[Oc]:i.CONSTANT_COLOR,[Bc]:i.ONE_MINUS_CONSTANT_COLOR,[kc]:i.CONSTANT_ALPHA,[zc]:i.ONE_MINUS_CONSTANT_ALPHA};function He(z,j,q,se,he,ie,be,ce,qe,ze){if(z===Mn){m===!0&&(ge(i.BLEND),m=!1);return}if(m===!1&&(te(i.BLEND),m=!0),z!==Mc){if(z!==h||ze!==C){if((S!==oi||g!==oi)&&(i.blendEquation(i.FUNC_ADD),S=oi,g=oi),ze)switch(z){case Zi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFunc(i.ONE,i.ONE);break;case tl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case nl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ke("WebGLState: Invalid blending: ",z);break}else switch(z){case Zi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case tl:ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nl:ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ke("WebGLState: Invalid blending: ",z);break}E=null,y=null,_=null,R=null,v.set(0,0,0),T=0,h=z,C=ze}return}he=he||j,ie=ie||q,be=be||se,(j!==S||he!==g)&&(i.blendEquationSeparate(ot[j],ot[he]),S=j,g=he),(q!==E||se!==y||ie!==_||be!==R)&&(i.blendFuncSeparate(Ve[q],Ve[se],Ve[ie],Ve[be]),E=q,y=se,_=ie,R=be),(ce.equals(v)===!1||qe!==T)&&(i.blendColor(ce.r,ce.g,ce.b,qe),v.copy(ce),T=qe),h=z,C=!1}function Qe(z,j){z.side===Dt?ge(i.CULL_FACE):te(i.CULL_FACE);let q=z.side===kt;j&&(q=!q),Oe(q),z.blending===Zi&&z.transparent===!1?He(Mn):He(z.blending,z.blendEquation,z.blendSrc,z.blendDst,z.blendEquationAlpha,z.blendSrcAlpha,z.blendDstAlpha,z.blendColor,z.blendAlpha,z.premultipliedAlpha),r.setFunc(z.depthFunc),r.setTest(z.depthTest),r.setMask(z.depthWrite),a.setMask(z.colorWrite);let se=z.stencilWrite;o.setTest(se),se&&(o.setMask(z.stencilWriteMask),o.setFunc(z.stencilFunc,z.stencilRef,z.stencilFuncMask),o.setOp(z.stencilFail,z.stencilZFail,z.stencilZPass)),_t(z.polygonOffset,z.polygonOffsetFactor,z.polygonOffsetUnits),z.alphaToCoverage===!0?te(i.SAMPLE_ALPHA_TO_COVERAGE):ge(i.SAMPLE_ALPHA_TO_COVERAGE)}function Oe(z){N!==z&&(z?i.frontFace(i.CW):i.frontFace(i.CCW),N=z)}function tt(z){z!==bc?(te(i.CULL_FACE),z!==L&&(z===Qo?i.cullFace(i.BACK):z===Sc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ge(i.CULL_FACE),L=z}function nt(z){z!==O&&(V&&i.lineWidth(z),O=z)}function _t(z,j,q){z?(te(i.POLYGON_OFFSET_FILL),(w!==j||D!==q)&&(w=j,D=q,r.getReversed()&&(j=-j),i.polygonOffset(j,q))):ge(i.POLYGON_OFFSET_FILL)}function Ke(z){z?te(i.SCISSOR_TEST):ge(i.SCISSOR_TEST)}function ye(z){z===void 0&&(z=i.TEXTURE0+P-1),B!==z&&(i.activeTexture(z),B=z)}function U(z,j,q){q===void 0&&(B===null?q=i.TEXTURE0+P-1:q=B);let se=F[q];se===void 0&&(se={type:void 0,texture:void 0},F[q]=se),(se.type!==z||se.texture!==j)&&(B!==q&&(i.activeTexture(q),B=q),i.bindTexture(z,j||J[z]),se.type=z,se.texture=j)}function it(){let z=F[B];z!==void 0&&z.type!==void 0&&(i.bindTexture(z.type,null),z.type=void 0,z.texture=void 0)}function je(){try{i.compressedTexImage2D(...arguments)}catch(z){ke("WebGLState:",z)}}function I(){try{i.compressedTexImage3D(...arguments)}catch(z){ke("WebGLState:",z)}}function b(){try{i.texSubImage2D(...arguments)}catch(z){ke("WebGLState:",z)}}function W(){try{i.texSubImage3D(...arguments)}catch(z){ke("WebGLState:",z)}}function X(){try{i.compressedTexSubImage2D(...arguments)}catch(z){ke("WebGLState:",z)}}function Q(){try{i.compressedTexSubImage3D(...arguments)}catch(z){ke("WebGLState:",z)}}function oe(){try{i.texStorage2D(...arguments)}catch(z){ke("WebGLState:",z)}}function de(){try{i.texStorage3D(...arguments)}catch(z){ke("WebGLState:",z)}}function ee(){try{i.texImage2D(...arguments)}catch(z){ke("WebGLState:",z)}}function ne(){try{i.texImage3D(...arguments)}catch(z){ke("WebGLState:",z)}}function le(z){return p[z]!==void 0?p[z]:i.getParameter(z)}function Ae(z,j){p[z]!==j&&(i.pixelStorei(z,j),p[z]=j)}function fe(z){Ie.equals(z)===!1&&(i.scissor(z.x,z.y,z.z,z.w),Ie.copy(z))}function ue(z){Me.equals(z)===!1&&(i.viewport(z.x,z.y,z.z,z.w),Me.copy(z))}function Ee(z,j){let q=c.get(j);q===void 0&&(q=new WeakMap,c.set(j,q));let se=q.get(z);se===void 0&&(se=i.getUniformBlockIndex(j,z.name),q.set(z,se))}function Le(z,j){let se=c.get(j).get(z);l.get(j)!==se&&(i.uniformBlockBinding(j,se,z.__bindingPointIndex),l.set(j,se))}function Ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),r.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),f={},p={},B=null,F={},u={},d=new WeakMap,x=[],M=null,m=!1,h=null,S=null,E=null,y=null,g=null,_=null,R=null,v=new $e(0,0,0),T=0,C=!1,N=null,L=null,O=null,w=null,D=null,Ie.set(0,0,i.canvas.width,i.canvas.height),Me.set(0,0,i.canvas.width,i.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:te,disable:ge,bindFramebuffer:De,drawBuffers:pe,useProgram:Be,setBlending:He,setMaterial:Qe,setFlipSided:Oe,setCullFace:tt,setLineWidth:nt,setPolygonOffset:_t,setScissorTest:Ke,activeTexture:ye,bindTexture:U,unbindTexture:it,compressedTexImage2D:je,compressedTexImage3D:I,texImage2D:ee,texImage3D:ne,pixelStorei:Ae,getParameter:le,updateUBOMapping:Ee,uniformBlockBinding:Le,texStorage2D:oe,texStorage3D:de,texSubImage2D:b,texSubImage3D:W,compressedTexSubImage2D:X,compressedTexSubImage3D:Q,scissor:fe,viewport:ue,reset:Ue}}function Cg(i,e,t,n,s,a,r){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new me,f=new WeakMap,p=new Set,u,d=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(I,b){return x?new OffscreenCanvas(I,b):gs("canvas")}function m(I,b,W){let X=1,Q=je(I);if((Q.width>W||Q.height>W)&&(X=W/Math.max(Q.width,Q.height)),X<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let oe=Math.floor(X*Q.width),de=Math.floor(X*Q.height);u===void 0&&(u=M(oe,de));let ee=b?M(oe,de):u;return ee.width=oe,ee.height=de,ee.getContext("2d").drawImage(I,0,0,oe,de),Fe("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+oe+"x"+de+")."),ee}else return"data"in I&&Fe("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),I;return I}function h(I){return I.generateMipmaps}function S(I){i.generateMipmap(I)}function E(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(I,b,W,X,Q,oe=!1){if(I!==null){if(i[I]!==void 0)return i[I];Fe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let de;X&&(de=e.get("EXT_texture_norm16"),de||Fe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ee=b;if(b===i.RED&&(W===i.FLOAT&&(ee=i.R32F),W===i.HALF_FLOAT&&(ee=i.R16F),W===i.UNSIGNED_BYTE&&(ee=i.R8),W===i.UNSIGNED_SHORT&&de&&(ee=de.R16_EXT),W===i.SHORT&&de&&(ee=de.R16_SNORM_EXT)),b===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.R8UI),W===i.UNSIGNED_SHORT&&(ee=i.R16UI),W===i.UNSIGNED_INT&&(ee=i.R32UI),W===i.BYTE&&(ee=i.R8I),W===i.SHORT&&(ee=i.R16I),W===i.INT&&(ee=i.R32I)),b===i.RG&&(W===i.FLOAT&&(ee=i.RG32F),W===i.HALF_FLOAT&&(ee=i.RG16F),W===i.UNSIGNED_BYTE&&(ee=i.RG8),W===i.UNSIGNED_SHORT&&de&&(ee=de.RG16_EXT),W===i.SHORT&&de&&(ee=de.RG16_SNORM_EXT)),b===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.RG8UI),W===i.UNSIGNED_SHORT&&(ee=i.RG16UI),W===i.UNSIGNED_INT&&(ee=i.RG32UI),W===i.BYTE&&(ee=i.RG8I),W===i.SHORT&&(ee=i.RG16I),W===i.INT&&(ee=i.RG32I)),b===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.RGB8UI),W===i.UNSIGNED_SHORT&&(ee=i.RGB16UI),W===i.UNSIGNED_INT&&(ee=i.RGB32UI),W===i.BYTE&&(ee=i.RGB8I),W===i.SHORT&&(ee=i.RGB16I),W===i.INT&&(ee=i.RGB32I)),b===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.RGBA8UI),W===i.UNSIGNED_SHORT&&(ee=i.RGBA16UI),W===i.UNSIGNED_INT&&(ee=i.RGBA32UI),W===i.BYTE&&(ee=i.RGBA8I),W===i.SHORT&&(ee=i.RGBA16I),W===i.INT&&(ee=i.RGBA32I)),b===i.RGB&&(W===i.UNSIGNED_SHORT&&de&&(ee=de.RGB16_EXT),W===i.SHORT&&de&&(ee=de.RGB16_SNORM_EXT),W===i.UNSIGNED_INT_5_9_9_9_REV&&(ee=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&(ee=i.R11F_G11F_B10F)),b===i.RGBA){let ne=oe?ms:Je.getTransfer(Q);W===i.FLOAT&&(ee=i.RGBA32F),W===i.HALF_FLOAT&&(ee=i.RGBA16F),W===i.UNSIGNED_BYTE&&(ee=ne===at?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT&&de&&(ee=de.RGBA16_EXT),W===i.SHORT&&de&&(ee=de.RGBA16_SNORM_EXT),W===i.UNSIGNED_SHORT_4_4_4_4&&(ee=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&(ee=i.RGB5_A1)}return(ee===i.R16F||ee===i.R32F||ee===i.RG16F||ee===i.RG32F||ee===i.RGBA16F||ee===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ee}function g(I,b){let W;return I?b===null||b===dn||b===Ki?W=i.DEPTH24_STENCIL8:b===hn?W=i.DEPTH32F_STENCIL8:b===Ji&&(W=i.DEPTH24_STENCIL8,Fe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===dn||b===Ki?W=i.DEPTH_COMPONENT24:b===hn?W=i.DEPTH_COMPONENT32F:b===Ji&&(W=i.DEPTH_COMPONENT16),W}function _(I,b){return h(I)===!0||I.isFramebufferTexture&&I.minFilter!==Et&&I.minFilter!==Ct?Math.log2(Math.max(b.width,b.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?b.mipmaps.length:1}function R(I){let b=I.target;b.removeEventListener("dispose",R),T(b),b.isVideoTexture&&f.delete(b),b.isHTMLTexture&&p.delete(b)}function v(I){let b=I.target;b.removeEventListener("dispose",v),N(b)}function T(I){let b=n.get(I);if(b.__webglInit===void 0)return;let W=I.source,X=d.get(W);if(X){let Q=X[b.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&C(I),Object.keys(X).length===0&&d.delete(W)}n.remove(I)}function C(I){let b=n.get(I);i.deleteTexture(b.__webglTexture);let W=I.source,X=d.get(W);delete X[b.__cacheKey],r.memory.textures--}function N(I){let b=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(b.__webglFramebuffer[X]))for(let Q=0;Q<b.__webglFramebuffer[X].length;Q++)i.deleteFramebuffer(b.__webglFramebuffer[X][Q]);else i.deleteFramebuffer(b.__webglFramebuffer[X]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[X])}else{if(Array.isArray(b.__webglFramebuffer))for(let X=0;X<b.__webglFramebuffer.length;X++)i.deleteFramebuffer(b.__webglFramebuffer[X]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let X=0;X<b.__webglColorRenderbuffer.length;X++)b.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[X]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let W=I.textures;for(let X=0,Q=W.length;X<Q;X++){let oe=n.get(W[X]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),r.memory.textures--),n.remove(W[X])}n.remove(I)}let L=0;function O(){L=0}function w(){return L}function D(I){L=I}function P(){let I=L;return I>=s.maxTextures&&Fe("WebGLTextures: Trying to use "+(I+1)+" texture units while this GPU supports only "+s.maxTextures),L+=1,I}function V(I){let b=[];return b.push(I.wrapS),b.push(I.wrapT),b.push(I.wrapR||0),b.push(I.magFilter),b.push(I.minFilter),b.push(I.anisotropy),b.push(I.internalFormat),b.push(I.format),b.push(I.type),b.push(I.generateMipmaps),b.push(I.premultiplyAlpha),b.push(I.flipY),b.push(I.unpackAlignment),b.push(I.colorSpace),b.join()}function Z(I,b){let W=n.get(I);if(I.isVideoTexture&&U(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&W.__version!==I.version){let X=I.image;if(X===null)Fe("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)Fe("WebGLRenderer: Texture marked for update but image is incomplete");else{ge(W,I,b);return}}else I.isExternalTexture&&(W.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+b)}function H(I,b){let W=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&W.__version!==I.version){ge(W,I,b);return}else I.isExternalTexture&&(W.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+b)}function B(I,b){let W=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&W.__version!==I.version){ge(W,I,b);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+b)}function F(I,b){let W=n.get(I);if(I.isCubeDepthTexture!==!0&&I.version>0&&W.__version!==I.version){De(W,I,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+b)}let re={[za]:i.REPEAT,[vn]:i.CLAMP_TO_EDGE,[Ga]:i.MIRRORED_REPEAT},ae={[Et]:i.NEAREST,[Hc]:i.NEAREST_MIPMAP_NEAREST,[Zs]:i.NEAREST_MIPMAP_LINEAR,[Ct]:i.LINEAR,[_r]:i.LINEAR_MIPMAP_NEAREST,[Kn]:i.LINEAR_MIPMAP_LINEAR},Ie={[Yc]:i.NEVER,[jc]:i.ALWAYS,[$c]:i.LESS,[io]:i.LEQUAL,[Zc]:i.EQUAL,[so]:i.GEQUAL,[Jc]:i.GREATER,[Kc]:i.NOTEQUAL};function Me(I,b){if(b.type===hn&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Ct||b.magFilter===_r||b.magFilter===Zs||b.magFilter===Kn||b.minFilter===Ct||b.minFilter===_r||b.minFilter===Zs||b.minFilter===Kn)&&Fe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,re[b.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,re[b.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,re[b.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,ae[b.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,ae[b.minFilter]),b.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,Ie[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Et||b.minFilter!==Zs&&b.minFilter!==Kn||b.type===hn&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(I,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Pe(I,b){let W=!1;I.__webglInit===void 0&&(I.__webglInit=!0,b.addEventListener("dispose",R));let X=b.source,Q=d.get(X);Q===void 0&&(Q={},d.set(X,Q));let oe=V(b);if(oe!==I.__cacheKey){Q[oe]===void 0&&(Q[oe]={texture:i.createTexture(),usedTimes:0},r.memory.textures++,W=!0),Q[oe].usedTimes++;let de=Q[I.__cacheKey];de!==void 0&&(Q[I.__cacheKey].usedTimes--,de.usedTimes===0&&C(b)),I.__cacheKey=oe,I.__webglTexture=Q[oe].texture}return W}function J(I,b,W){return Math.floor(Math.floor(I/W)/b)}function te(I,b,W,X){let oe=I.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,W,X,b.data);else{oe.sort((Ae,fe)=>Ae.start-fe.start);let de=0;for(let Ae=1;Ae<oe.length;Ae++){let fe=oe[de],ue=oe[Ae],Ee=fe.start+fe.count,Le=J(ue.start,b.width,4),Ue=J(fe.start,b.width,4);ue.start<=Ee+1&&Le===Ue&&J(ue.start+ue.count-1,b.width,4)===Le?fe.count=Math.max(fe.count,ue.start+ue.count-fe.start):(++de,oe[de]=ue)}oe.length=de+1;let ee=t.getParameter(i.UNPACK_ROW_LENGTH),ne=t.getParameter(i.UNPACK_SKIP_PIXELS),le=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let Ae=0,fe=oe.length;Ae<fe;Ae++){let ue=oe[Ae],Ee=Math.floor(ue.start/4),Le=Math.ceil(ue.count/4),Ue=Ee%b.width,z=Math.floor(Ee/b.width),j=Le,q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Ue),t.pixelStorei(i.UNPACK_SKIP_ROWS,z),t.texSubImage2D(i.TEXTURE_2D,0,Ue,z,j,q,W,X,b.data)}I.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,ee),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(i.UNPACK_SKIP_ROWS,le)}}function ge(I,b,W){let X=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(X=i.TEXTURE_3D);let Q=Pe(I,b),oe=b.source;t.bindTexture(X,I.__webglTexture,i.TEXTURE0+W);let de=n.get(oe);if(oe.version!==de.__version||Q===!0){if(t.activeTexture(i.TEXTURE0+W),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){let q=Je.getPrimaries(Je.workingColorSpace),se=b.colorSpace===Ln?null:Je.getPrimaries(b.colorSpace),he=b.colorSpace===Ln||q===se?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,he)}t.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment);let ne=m(b.image,!1,s.maxTextureSize);ne=it(b,ne);let le=a.convert(b.format,b.colorSpace),Ae=a.convert(b.type),fe=y(b.internalFormat,le,Ae,b.normalized,b.colorSpace,b.isVideoTexture);Me(X,b);let ue,Ee=b.mipmaps,Le=b.isVideoTexture!==!0,Ue=de.__version===void 0||Q===!0,z=oe.dataReady,j=_(b,ne);if(b.isDepthTexture)fe=g(b.format===jn,b.type),Ue&&(Le?t.texStorage2D(i.TEXTURE_2D,1,fe,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,fe,ne.width,ne.height,0,le,Ae,null));else if(b.isDataTexture)if(Ee.length>0){Le&&Ue&&t.texStorage2D(i.TEXTURE_2D,j,fe,Ee[0].width,Ee[0].height);for(let q=0,se=Ee.length;q<se;q++)ue=Ee[q],Le?z&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,ue.width,ue.height,le,Ae,ue.data):t.texImage2D(i.TEXTURE_2D,q,fe,ue.width,ue.height,0,le,Ae,ue.data);b.generateMipmaps=!1}else Le?(Ue&&t.texStorage2D(i.TEXTURE_2D,j,fe,ne.width,ne.height),z&&te(b,ne,le,Ae)):t.texImage2D(i.TEXTURE_2D,0,fe,ne.width,ne.height,0,le,Ae,ne.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Le&&Ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,j,fe,Ee[0].width,Ee[0].height,ne.depth);for(let q=0,se=Ee.length;q<se;q++)if(ue=Ee[q],b.format!==tn)if(le!==null)if(Le){if(z)if(b.layerUpdates.size>0){let he=El(ue.width,ue.height,b.format,b.type);for(let ie of b.layerUpdates){let be=ue.data.subarray(ie*he/ue.data.BYTES_PER_ELEMENT,(ie+1)*he/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,ie,ue.width,ue.height,1,le,be)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,ue.width,ue.height,ne.depth,le,ue.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,q,fe,ue.width,ue.height,ne.depth,0,ue.data,0,0);else Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Le?z&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,ue.width,ue.height,ne.depth,le,Ae,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,q,fe,ue.width,ue.height,ne.depth,0,le,Ae,ue.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Le&&Ue&&t.texStorage2D(i.TEXTURE_2D,j,fe,Ee[0].width,Ee[0].height);for(let q=0,se=Ee.length;q<se;q++)ue=Ee[q],b.format!==tn?le!==null?Le?z&&t.compressedTexSubImage2D(i.TEXTURE_2D,q,0,0,ue.width,ue.height,le,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,q,fe,ue.width,ue.height,0,ue.data):Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Le?z&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,ue.width,ue.height,le,Ae,ue.data):t.texImage2D(i.TEXTURE_2D,q,fe,ue.width,ue.height,0,le,Ae,ue.data)}else if(b.isDataArrayTexture)if(Le){if(Ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,j,fe,ne.width,ne.height,ne.depth),z)if(b.layerUpdates.size>0){let q=El(ne.width,ne.height,b.format,b.type);for(let se of b.layerUpdates){let he=ne.data.subarray(se*q/ne.data.BYTES_PER_ELEMENT,(se+1)*q/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,se,ne.width,ne.height,1,le,Ae,he)}b.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,le,Ae,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,fe,ne.width,ne.height,ne.depth,0,le,Ae,ne.data);else if(b.isData3DTexture)Le?(Ue&&t.texStorage3D(i.TEXTURE_3D,j,fe,ne.width,ne.height,ne.depth),z&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,le,Ae,ne.data)):t.texImage3D(i.TEXTURE_3D,0,fe,ne.width,ne.height,ne.depth,0,le,Ae,ne.data);else if(b.isFramebufferTexture){if(Ue)if(Le)t.texStorage2D(i.TEXTURE_2D,j,fe,ne.width,ne.height);else{let q=ne.width,se=ne.height;for(let he=0;he<j;he++)t.texImage2D(i.TEXTURE_2D,he,fe,q,se,0,le,Ae,null),q>>=1,se>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in i){let q=i.canvas;if(q.hasAttribute("layoutsubtree")||q.setAttribute("layoutsubtree","true"),ne.parentNode!==q){q.appendChild(ne),p.add(b),q.onpaint=se=>{let he=se.changedElements;for(let ie of p)he.includes(ie.image)&&(ie.needsUpdate=!0)},q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ne);else{let he=i.RGBA,ie=i.RGBA,be=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,he,ie,be,ne)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ee.length>0){if(Le&&Ue){let q=je(Ee[0]);t.texStorage2D(i.TEXTURE_2D,j,fe,q.width,q.height)}for(let q=0,se=Ee.length;q<se;q++)ue=Ee[q],Le?z&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,le,Ae,ue):t.texImage2D(i.TEXTURE_2D,q,fe,le,Ae,ue);b.generateMipmaps=!1}else if(Le){if(Ue){let q=je(ne);t.texStorage2D(i.TEXTURE_2D,j,fe,q.width,q.height)}z&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,le,Ae,ne)}else t.texImage2D(i.TEXTURE_2D,0,fe,le,Ae,ne);h(b)&&S(X),de.__version=oe.version,b.onUpdate&&b.onUpdate(b)}I.__version=b.version}function De(I,b,W){if(b.image.length!==6)return;let X=Pe(I,b),Q=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+W);let oe=n.get(Q);if(Q.version!==oe.__version||X===!0){t.activeTexture(i.TEXTURE0+W);let de=Je.getPrimaries(Je.workingColorSpace),ee=b.colorSpace===Ln?null:Je.getPrimaries(b.colorSpace),ne=b.colorSpace===Ln||de===ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);let le=b.isCompressedTexture||b.image[0].isCompressedTexture,Ae=b.image[0]&&b.image[0].isDataTexture,fe=[];for(let ie=0;ie<6;ie++)!le&&!Ae?fe[ie]=m(b.image[ie],!0,s.maxCubemapSize):fe[ie]=Ae?b.image[ie].image:b.image[ie],fe[ie]=it(b,fe[ie]);let ue=fe[0],Ee=a.convert(b.format,b.colorSpace),Le=a.convert(b.type),Ue=y(b.internalFormat,Ee,Le,b.normalized,b.colorSpace),z=b.isVideoTexture!==!0,j=oe.__version===void 0||X===!0,q=Q.dataReady,se=_(b,ue);Me(i.TEXTURE_CUBE_MAP,b);let he;if(le){z&&j&&t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Ue,ue.width,ue.height);for(let ie=0;ie<6;ie++){he=fe[ie].mipmaps;for(let be=0;be<he.length;be++){let ce=he[be];b.format!==tn?Ee!==null?z?q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be,0,0,ce.width,ce.height,Ee,ce.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be,Ue,ce.width,ce.height,0,ce.data):Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):z?q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be,0,0,ce.width,ce.height,Ee,Le,ce.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be,Ue,ce.width,ce.height,0,Ee,Le,ce.data)}}}else{if(he=b.mipmaps,z&&j){he.length>0&&se++;let ie=je(fe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Ue,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Ae){z?q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,fe[ie].width,fe[ie].height,Ee,Le,fe[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,Ue,fe[ie].width,fe[ie].height,0,Ee,Le,fe[ie].data);for(let be=0;be<he.length;be++){let qe=he[be].image[ie].image;z?q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be+1,0,0,qe.width,qe.height,Ee,Le,qe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be+1,Ue,qe.width,qe.height,0,Ee,Le,qe.data)}}else{z?q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ee,Le,fe[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,Ue,Ee,Le,fe[ie]);for(let be=0;be<he.length;be++){let ce=he[be];z?q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be+1,0,0,Ee,Le,ce.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,be+1,Ue,Ee,Le,ce.image[ie])}}}h(b)&&S(i.TEXTURE_CUBE_MAP),oe.__version=Q.version,b.onUpdate&&b.onUpdate(b)}I.__version=b.version}function pe(I,b,W,X,Q,oe){let de=a.convert(W.format,W.colorSpace),ee=a.convert(W.type),ne=y(W.internalFormat,de,ee,W.normalized,W.colorSpace),le=n.get(b),Ae=n.get(W);if(Ae.__renderTarget=b,!le.__hasExternalTextures){let fe=Math.max(1,b.width>>oe),ue=Math.max(1,b.height>>oe);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?t.texImage3D(Q,oe,ne,fe,ue,b.depth,0,de,ee,null):t.texImage2D(Q,oe,ne,fe,ue,0,de,ee,null)}t.bindFramebuffer(i.FRAMEBUFFER,I),ye(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,Q,Ae.__webglTexture,0,Ke(b)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,Q,Ae.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Be(I,b,W){if(i.bindRenderbuffer(i.RENDERBUFFER,I),b.depthBuffer){let X=b.depthTexture,Q=X&&X.isDepthTexture?X.type:null,oe=g(b.stencilBuffer,Q),de=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ye(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ke(b),oe,b.width,b.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ke(b),oe,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,oe,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,I)}else{let X=b.textures;for(let Q=0;Q<X.length;Q++){let oe=X[Q],de=a.convert(oe.format,oe.colorSpace),ee=a.convert(oe.type),ne=y(oe.internalFormat,de,ee,oe.normalized,oe.colorSpace);ye(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ke(b),ne,b.width,b.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ke(b),ne,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,ne,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ot(I,b,W){let X=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,I),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Q=n.get(b.depthTexture);if(Q.__renderTarget=b,(!Q.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),X){if(Q.__webglInit===void 0&&(Q.__webglInit=!0,b.depthTexture.addEventListener("dispose",R)),Q.__webglTexture===void 0){Q.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),Me(i.TEXTURE_CUBE_MAP,b.depthTexture);let le=a.convert(b.depthTexture.format),Ae=a.convert(b.depthTexture.type),fe;b.depthTexture.format===yn?fe=i.DEPTH_COMPONENT24:b.depthTexture.format===jn&&(fe=i.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,fe,b.width,b.height,0,le,Ae,null)}}else Z(b.depthTexture,0);let oe=Q.__webglTexture,de=Ke(b),ee=X?i.TEXTURE_CUBE_MAP_POSITIVE_X+W:i.TEXTURE_2D,ne=b.depthTexture.format===jn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===yn)ye(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,ee,oe,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ne,ee,oe,0);else if(b.depthTexture.format===jn)ye(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,ee,oe,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ne,ee,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ve(I){let b=n.get(I),W=I.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==I.depthTexture){let X=I.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),X){let Q=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,X.removeEventListener("dispose",Q)};X.addEventListener("dispose",Q),b.__depthDisposeCallback=Q}b.__boundDepthTexture=X}if(I.depthTexture&&!b.__autoAllocateDepthBuffer)if(W)for(let X=0;X<6;X++)ot(b.__webglFramebuffer[X],I,X);else{let X=I.texture.mipmaps;X&&X.length>0?ot(b.__webglFramebuffer[0],I,0):ot(b.__webglFramebuffer,I,0)}else if(W){b.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[X]),b.__webglDepthbuffer[X]===void 0)b.__webglDepthbuffer[X]=i.createRenderbuffer(),Be(b.__webglDepthbuffer[X],I,!1);else{let Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=b.__webglDepthbuffer[X];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,oe)}}else{let X=I.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Be(b.__webglDepthbuffer,I,!1);else{let Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function He(I,b,W){let X=n.get(I);b!==void 0&&pe(X.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&Ve(I)}function Qe(I){let b=I.texture,W=n.get(I),X=n.get(b);I.addEventListener("dispose",v);let Q=I.textures,oe=I.isWebGLCubeRenderTarget===!0,de=Q.length>1;if(de||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=b.version,r.memory.textures++),oe){W.__webglFramebuffer=[];for(let ee=0;ee<6;ee++)if(b.mipmaps&&b.mipmaps.length>0){W.__webglFramebuffer[ee]=[];for(let ne=0;ne<b.mipmaps.length;ne++)W.__webglFramebuffer[ee][ne]=i.createFramebuffer()}else W.__webglFramebuffer[ee]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){W.__webglFramebuffer=[];for(let ee=0;ee<b.mipmaps.length;ee++)W.__webglFramebuffer[ee]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(de)for(let ee=0,ne=Q.length;ee<ne;ee++){let le=n.get(Q[ee]);le.__webglTexture===void 0&&(le.__webglTexture=i.createTexture(),r.memory.textures++)}if(I.samples>0&&ye(I)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let ee=0;ee<Q.length;ee++){let ne=Q[ee];W.__webglColorRenderbuffer[ee]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[ee]);let le=a.convert(ne.format,ne.colorSpace),Ae=a.convert(ne.type),fe=y(ne.internalFormat,le,Ae,ne.normalized,ne.colorSpace,I.isXRRenderTarget===!0),ue=Ke(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,ue,fe,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ee,i.RENDERBUFFER,W.__webglColorRenderbuffer[ee])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),Be(W.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),Me(i.TEXTURE_CUBE_MAP,b);for(let ee=0;ee<6;ee++)if(b.mipmaps&&b.mipmaps.length>0)for(let ne=0;ne<b.mipmaps.length;ne++)pe(W.__webglFramebuffer[ee][ne],I,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ne);else pe(W.__webglFramebuffer[ee],I,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0);h(b)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let ee=0,ne=Q.length;ee<ne;ee++){let le=Q[ee],Ae=n.get(le),fe=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(fe=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,Ae.__webglTexture),Me(fe,le),pe(W.__webglFramebuffer,I,le,i.COLOR_ATTACHMENT0+ee,fe,0),h(le)&&S(fe)}t.unbindTexture()}else{let ee=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(ee=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ee,X.__webglTexture),Me(ee,b),b.mipmaps&&b.mipmaps.length>0)for(let ne=0;ne<b.mipmaps.length;ne++)pe(W.__webglFramebuffer[ne],I,b,i.COLOR_ATTACHMENT0,ee,ne);else pe(W.__webglFramebuffer,I,b,i.COLOR_ATTACHMENT0,ee,0);h(b)&&S(ee),t.unbindTexture()}I.depthBuffer&&Ve(I)}function Oe(I){let b=I.textures;for(let W=0,X=b.length;W<X;W++){let Q=b[W];if(h(Q)){let oe=E(I),de=n.get(Q).__webglTexture;t.bindTexture(oe,de),S(oe),t.unbindTexture()}}}let tt=[],nt=[];function _t(I){if(I.samples>0){if(ye(I)===!1){let b=I.textures,W=I.width,X=I.height,Q=i.COLOR_BUFFER_BIT,oe=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(I),ee=b.length>1;if(ee)for(let le=0;le<b.length;le++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);let ne=I.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let le=0;le<b.length;le++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),ee){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[le]);let Ae=n.get(b[le]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ae,0)}i.blitFramebuffer(0,0,W,X,0,0,W,X,Q,i.NEAREST),l===!0&&(tt.length=0,nt.length=0,tt.push(i.COLOR_ATTACHMENT0+le),I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&(tt.push(oe),nt.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,nt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,tt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ee)for(let le=0;le<b.length;le++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,de.__webglColorRenderbuffer[le]);let Ae=n.get(b[le]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,Ae,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&l){let b=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function Ke(I){return Math.min(s.maxSamples,I.samples)}function ye(I){let b=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function U(I){let b=r.render.frame;f.get(I)!==b&&(f.set(I,b),I.update())}function it(I,b){let W=I.colorSpace,X=I.format,Q=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||W!==ps&&W!==Ln&&(Je.getTransfer(W)===at?(X!==tn||Q!==Xt)&&Fe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ke("WebGLTextures: Unsupported texture color space:",W)),b}function je(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=P,this.resetTextureUnits=O,this.getTextureUnits=w,this.setTextureUnits=D,this.setTexture2D=Z,this.setTexture2DArray=H,this.setTexture3D=B,this.setTextureCube=F,this.rebindTextures=He,this.setupRenderTarget=Qe,this.updateRenderTargetMipmap=Oe,this.updateMultisampleRenderTarget=_t,this.setupDepthRenderbuffer=Ve,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=ye,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Rg(i,e){function t(n,s=Ln){let a,r=Je.getTransfer(s);if(n===Xt)return i.UNSIGNED_BYTE;if(n===br)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Sr)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ml)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===gl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===fl)return i.BYTE;if(n===pl)return i.SHORT;if(n===Ji)return i.UNSIGNED_SHORT;if(n===yr)return i.INT;if(n===dn)return i.UNSIGNED_INT;if(n===hn)return i.FLOAT;if(n===un)return i.HALF_FLOAT;if(n===xl)return i.ALPHA;if(n===vl)return i.RGB;if(n===tn)return i.RGBA;if(n===yn)return i.DEPTH_COMPONENT;if(n===jn)return i.DEPTH_STENCIL;if(n===_l)return i.RED;if(n===Mr)return i.RED_INTEGER;if(n===Qn)return i.RG;if(n===wr)return i.RG_INTEGER;if(n===Tr)return i.RGBA_INTEGER;if(n===Js||n===Ks||n===js||n===Qs)if(r===at)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(n===Js)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ks)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===js)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Qs)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(n===Js)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ks)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===js)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Qs)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Er||n===Ar||n===Cr||n===Rr)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(n===Er)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ar)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Cr)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Rr)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Nr||n===Ir||n===Pr||n===Lr||n===Dr||n===ea||n===Ur)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(n===Nr||n===Ir)return r===at?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===Pr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(n===Lr)return a.COMPRESSED_R11_EAC;if(n===Dr)return a.COMPRESSED_SIGNED_R11_EAC;if(n===ea)return a.COMPRESSED_RG11_EAC;if(n===Ur)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Fr||n===Or||n===Br||n===kr||n===zr||n===Gr||n===Vr||n===Hr||n===Wr||n===Xr||n===qr||n===Yr||n===$r||n===Zr)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(n===Fr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Or)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Br)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===kr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===zr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Gr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Vr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Hr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===qr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Yr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===$r)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Zr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Jr||n===Kr||n===jr)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(n===Jr)return r===at?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Kr)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===jr)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Qr||n===eo||n===ta||n===to)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(n===Qr)return a.COMPRESSED_RED_RGTC1_EXT;if(n===eo)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ta)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===to)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ki?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Ng=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ig=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Xl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ts(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Jt({vertexShader:Ng,fragmentShader:Ig,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Wt(new Fs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ql=class extends bn{constructor(e,t){super();let n=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,f=null,p=null,u=null,d=null,x=null,M=typeof XRWebGLBinding<"u",m=new Xl,h={},S=t.getContextAttributes(),E=null,y=null,g=[],_=[],R=new me,v=null,T=null,C=new At;C.viewport=new xt;let N=new At;N.viewport=new xt;let L=[C,N],O=new pr,w=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let te=g[J];return te===void 0&&(te=new Ui,g[J]=te),te.getTargetRaySpace()},this.getControllerGrip=function(J){let te=g[J];return te===void 0&&(te=new Ui,g[J]=te),te.getGripSpace()},this.getHand=function(J){let te=g[J];return te===void 0&&(te=new Ui,g[J]=te),te.getHandSpace()};function P(J){let te=_.indexOf(J.inputSource);if(te===-1)return;let ge=g[te];ge!==void 0&&(ge.update(J.inputSource,J.frame,c||r),ge.dispatchEvent({type:J.type,data:J.inputSource}))}function V(){s.removeEventListener("select",P),s.removeEventListener("selectstart",P),s.removeEventListener("selectend",P),s.removeEventListener("squeeze",P),s.removeEventListener("squeezestart",P),s.removeEventListener("squeezeend",P),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",Z);for(let J=0;J<g.length;J++){let te=_[J];te!==null&&(_[J]=null,g[J].disconnect(te))}w=null,D=null,m.reset();for(let J in h)delete h[J];if(e.setRenderTarget(E),d=null,u=null,p=null,s=null,y=null,Pe.stop(),n.isPresenting=!1,e.setPixelRatio(v),e.setSize(R.width,R.height,!1),T!==null){let J=T.camera;J.fov=T.fov,J.zoom=T.zoom,J.updateProjectionMatrix(),T=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){a=J,n.isPresenting===!0&&Fe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&Fe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return p===null&&M&&(p=new XRWebGLBinding(s,t)),p},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",P),s.addEventListener("selectstart",P),s.addEventListener("selectend",P),s.addEventListener("squeeze",P),s.addEventListener("squeezestart",P),s.addEventListener("squeezeend",P),s.addEventListener("end",V),s.addEventListener("inputsourceschange",Z),S.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(R),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let ge=null,De=null,pe=null;S.depth&&(pe=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ge=S.stencil?jn:yn,De=S.stencil?Ki:dn);let Be={colorFormat:t.RGBA8,depthFormat:pe,scaleFactor:a};p=this.getBinding(),u=p.createProjectionLayer(Be),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new Ht(u.textureWidth,u.textureHeight,{format:tn,type:Xt,depthTexture:new Xn(u.textureWidth,u.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,ge),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let ge={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,t,ge),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new Ht(d.framebufferWidth,d.framebufferHeight,{format:tn,type:Xt,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),Pe.setContext(s),Pe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Z(J){for(let te=0;te<J.removed.length;te++){let ge=J.removed[te],De=_.indexOf(ge);De>=0&&(_[De]=null,g[De].disconnect(ge))}for(let te=0;te<J.added.length;te++){let ge=J.added[te],De=_.indexOf(ge);if(De===-1){for(let Be=0;Be<g.length;Be++)if(Be>=_.length){_.push(ge),De=Be;break}else if(_[Be]===null){_[Be]=ge,De=Be;break}if(De===-1)break}let pe=g[De];pe&&pe.connect(ge)}}let H=new k,B=new k;function F(J,te,ge){H.setFromMatrixPosition(te.matrixWorld),B.setFromMatrixPosition(ge.matrixWorld);let De=H.distanceTo(B),pe=te.projectionMatrix.elements,Be=ge.projectionMatrix.elements,ot=pe[14]/(pe[10]-1),Ve=pe[14]/(pe[10]+1),He=(pe[9]+1)/pe[5],Qe=(pe[9]-1)/pe[5],Oe=(pe[8]-1)/pe[0],tt=(Be[8]+1)/Be[0],nt=ot*Oe,_t=ot*tt,Ke=De/(-Oe+tt),ye=Ke*-Oe;if(te.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(ye),J.translateZ(Ke),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),pe[10]===-1)J.projectionMatrix.copy(te.projectionMatrix),J.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{let U=ot+Ke,it=Ve+Ke,je=nt-ye,I=_t+(De-ye),b=He*Ve/it*U,W=Qe*Ve/it*U;J.projectionMatrix.makePerspective(je,I,b,W,U,it),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function re(J,te){te===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(te.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let te=J.near,ge=J.far;m.texture!==null&&(m.depthNear>0&&(te=m.depthNear),m.depthFar>0&&(ge=m.depthFar)),O.near=N.near=C.near=te,O.far=N.far=C.far=ge,(w!==O.near||D!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),w=O.near,D=O.far),O.layers.mask=J.layers.mask|6,C.layers.mask=O.layers.mask&-5,N.layers.mask=O.layers.mask&-3;let De=J.parent,pe=O.cameras;re(O,De);for(let Be=0;Be<pe.length;Be++)re(pe[Be],De);pe.length===2?F(O,C,N):O.projectionMatrix.copy(C.projectionMatrix),T===null&&J.isPerspectiveCamera&&(T={camera:J,fov:J.fov,zoom:J.zoom}),ae(J,O,De)};function ae(J,te,ge){ge===null?J.matrix.copy(te.matrixWorld):(J.matrix.copy(ge.matrixWorld),J.matrix.invert(),J.matrix.multiply(te.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(te.projectionMatrix),J.projectionMatrixInverse.copy(te.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ha*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(J){return h[J]};let Ie=null;function Me(J,te){if(f=te.getViewerPose(c||r),x=te,f!==null){let ge=f.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let De=!1;ge.length!==O.cameras.length&&(O.cameras.length=0,De=!0);for(let Ve=0;Ve<ge.length;Ve++){let He=ge[Ve],Qe=null;if(d!==null)Qe=d.getViewport(He);else{let tt=p.getViewSubImage(u,He);Qe=tt.viewport,Ve===0&&(e.setRenderTargetTextures(y,tt.colorTexture,tt.depthStencilTexture),e.setRenderTarget(y))}let Oe=L[Ve];Oe===void 0&&(Oe=new At,Oe.layers.enable(Ve),Oe.viewport=new xt,L[Ve]=Oe),Oe.matrix.fromArray(He.transform.matrix),Oe.matrix.decompose(Oe.position,Oe.quaternion,Oe.scale),Oe.projectionMatrix.fromArray(He.projectionMatrix),Oe.projectionMatrixInverse.copy(Oe.projectionMatrix).invert(),Oe.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),Ve===0&&(O.matrix.copy(Oe.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),De===!0&&O.cameras.push(Oe)}let pe=s.enabledFeatures;if(pe&&pe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){p=n.getBinding();let Ve=p.getDepthInformation(ge[0]);Ve&&Ve.isValid&&Ve.texture&&m.init(Ve,s.renderState)}if(pe&&pe.includes("camera-access")&&M){e.state.unbindTexture(),p=n.getBinding();for(let Ve=0;Ve<ge.length;Ve++){let He=ge[Ve].camera;if(He){let Qe=h[He];Qe||(Qe=new Ts,h[He]=Qe);let Oe=p.getCameraImage(He);Qe.sourceTexture=Oe}}}}for(let ge=0;ge<g.length;ge++){let De=_[ge],pe=g[ge];De!==null&&pe!==void 0&&pe.update(De,te,c||r)}Ie&&Ie(J,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),x=null}let Pe=new Ld;Pe.setAnimationLoop(Me),this.setAnimationLoop=function(J){Ie=J},this.dispose=function(){}}},Pg=new gt,kd=new Ge;kd.set(-1,0,0,0,1,0,0,0,1);function Lg(i,e){function t(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function n(m,h){h.color.getRGB(m.fogColor.value,Ml(i)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function s(m,h,S,E,y){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?a(m,h):h.isMeshLambertMaterial?(a(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(a(m,h),p(m,h)):h.isMeshPhongMaterial?(a(m,h),f(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(a(m,h),u(m,h),h.isMeshPhysicalMaterial&&d(m,h,y)):h.isMeshMatcapMaterial?(a(m,h),x(m,h)):h.isMeshDepthMaterial?a(m,h):h.isMeshDistanceMaterial?(a(m,h),M(m,h)):h.isMeshNormalMaterial?a(m,h):h.isLineBasicMaterial?(r(m,h),h.isLineDashedMaterial&&o(m,h)):h.isPointsMaterial?l(m,h,S,E):h.isSpriteMaterial?c(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function a(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,t(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,t(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===kt&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,t(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===kt&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,t(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,t(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,t(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);let S=e.get(h),E=S.envMap,y=S.envMapRotation;E&&(m.envMap.value=E,m.envMapRotation.value.setFromMatrix4(Pg.makeRotationFromEuler(y)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(kd),m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,t(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,t(h.aoMap,m.aoMapTransform))}function r(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,t(h.map,m.mapTransform))}function o(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,S,E){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*S,m.scale.value=E*.5,h.map&&(m.map.value=h.map,t(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,t(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function f(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function p(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function u(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function d(m,h,S){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===kt&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.retroreflectivity>0&&(m.retroreflectivity.value=h.retroreflectivity),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,h){h.matcap&&(m.matcap.value=h.matcap)}function M(m,h){let S=e.get(h).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Dg(i,e,t,n){let s={},a={},r=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,g){let _=g.program;n.uniformBlockBinding(y,_)}function c(y,g){let _=s[y.id];_===void 0&&(m(y),_=f(y),s[y.id]=_,y.addEventListener("dispose",S));let R=g.program;n.updateUBOMapping(y,R);let v=e.render.frame;a[y.id]!==v&&(u(y),a[y.id]=v)}function f(y){let g=p();y.__bindingPointIndex=g;let _=i.createBuffer(),R=y.__size,v=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,_),i.bufferData(i.UNIFORM_BUFFER,R,v),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,g,_),_}function p(){for(let y=0;y<o;y++)if(r.indexOf(y)===-1)return r.push(y),y;return ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let g=s[y.id],_=y.uniforms,R=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,g);for(let v=0,T=_.length;v<T;v++){let C=_[v];if(Array.isArray(C))for(let N=0,L=C.length;N<L;N++)d(C[N],v,N,R);else d(C,v,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(y,g,_,R){if(M(y,g,_,R)===!0){let v=y.__offset,T=y.value;if(Array.isArray(T)){let C=0;for(let N=0;N<T.length;N++){let L=T[N],O=h(L);x(L,y.__data,C),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(C+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(T,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,v,y.__data)}}function x(y,g,_){typeof y=="number"||typeof y=="boolean"?g[0]=y:y.isMatrix3?(g[0]=y.elements[0],g[1]=y.elements[1],g[2]=y.elements[2],g[3]=0,g[4]=y.elements[3],g[5]=y.elements[4],g[6]=y.elements[5],g[7]=0,g[8]=y.elements[6],g[9]=y.elements[7],g[10]=y.elements[8],g[11]=0):ArrayBuffer.isView(y)?g.set(new y.constructor(y.buffer,y.byteOffset,g.length)):y.toArray(g,_)}function M(y,g,_,R){let v=y.value,T=g+"_"+_;if(R[T]===void 0)return typeof v=="number"||typeof v=="boolean"?R[T]=v:ArrayBuffer.isView(v)?R[T]=v.slice():R[T]=v.clone(),!0;{let C=R[T];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return R[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function m(y){let g=y.uniforms,_=0,R=16;for(let T=0,C=g.length;T<C;T++){let N=Array.isArray(g[T])?g[T]:[g[T]];for(let L=0,O=N.length;L<O;L++){let w=N[L],D=Array.isArray(w.value)?w.value:[w.value];for(let P=0,V=D.length;P<V;P++){let Z=D[P],H=h(Z),B=_%R,F=B%H.boundary,re=B+F;_+=F,re!==0&&R-re<H.storage&&(_+=R-re),w.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),w.__offset=_,_+=H.storage}}}let v=_%R;return v>0&&(_+=R-v),y.__size=_,y.__cache={},this}function h(y){let g={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(g.boundary=4,g.storage=4):y.isVector2?(g.boundary=8,g.storage=8):y.isVector3||y.isColor?(g.boundary=16,g.storage=12):y.isVector4?(g.boundary=16,g.storage=16):y.isMatrix3?(g.boundary=48,g.storage=48):y.isMatrix4?(g.boundary=64,g.storage=64):y.isTexture?Fe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(g.boundary=16,g.storage=y.byteLength):Fe("WebGLRenderer: Unsupported uniform value type.",y),g}function S(y){let g=y.target;g.removeEventListener("dispose",S);let _=r.indexOf(g.__bindingPointIndex);r.splice(_,1),i.deleteBuffer(s[g.id]),delete s[g.id],delete a[g.id]}function E(){for(let y in s)i.deleteBuffer(s[y]);r=[],s={},a={}}return{bind:l,update:c,dispose:E}}var Ug=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),wn=null;function Fg(){return wn===null&&(wn=new $a(Ug,16,16,Qn,un),wn.name="DFG_LUT",wn.minFilter=Ct,wn.magFilter=Ct,wn.wrapS=vn,wn.wrapT=vn,wn.generateMipmaps=!1,wn.needsUpdate=!0),wn}var co=class{constructor(e={}){let{canvas:t=ed(),context:n=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:d=Xt}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=r;let M=d,m=new Set([Tr,wr,Mr]),h=new Set([Xt,dn,Ji,Ki,br,Sr]),S=new Uint32Array(4),E=new Int32Array(4),y=new k,g=null,_=null,R=[],v=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=cn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,N=!1,L=null,O=null,w=null,D=null;this._outputColorSpace=Bt;let P=0,V=0,Z=null,H=-1,B=null,F=new xt,re=new xt,ae=null,Ie=new $e(0),Me=0,Pe=t.width,J=t.height,te=1,ge=null,De=null,pe=new xt(0,0,Pe,J),Be=new xt(0,0,Pe,J),ot=!1,Ve=new Oi,He=!1,Qe=!1,Oe=new gt,tt=new k,nt=new xt,_t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ke=!1;function ye(){return Z===null?te:1}let U=n;function it(A,G){return t.getContext(A,G)}let je,I,b,W,X,Q,oe,de,ee,ne,le,Ae,fe,ue,Ee,Le,Ue,z,j,q,se,he,ie;try{let A={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",qe,!1),t.addEventListener("webglcontextrestored",ze,!1),t.addEventListener("webglcontextcreationerror",lt,!1),U===null){let G="webgl2";if(U=it(G,A),U===null)throw it(G)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}be()}catch(A){throw t.removeEventListener("webglcontextlost",qe,!1),t.removeEventListener("webglcontextrestored",ze,!1),t.removeEventListener("webglcontextcreationerror",lt,!1),ke("WebGLRenderer: "+A.message),A}function be(){je=new Hp(U),je.init(),se=new Rg(U,je),I=new Lp(U,je,e,se),b=new Ag(U,je),I.reversedDepthBuffer&&u&&b.buffers.depth.setReversed(!0),O=U.createFramebuffer(),w=U.createFramebuffer(),D=U.createFramebuffer(),W=new qp(U),X=new fg,Q=new Cg(U,je,b,X,I,se,W),oe=new Vp(C),de=new Yh(U),he=new Ip(U,de),ee=new Wp(U,de,W,he),ne=new $p(U,ee,de,he,W),z=new Yp(U,I,Q),Ee=new Dp(X),le=new ug(C,oe,je,I,he,Ee),Ae=new Lg(C,X),fe=new mg,ue=new bg(je),Ue=new Np(C,oe,b,ne,x,l),Le=new Eg(C,ne,I),ie=new Dg(U,W,I,b),j=new Pp(U,je,W),q=new Xp(U,je,W),W.programs=le.programs,C.capabilities=I,C.extensions=je,C.properties=X,C.renderLists=fe,C.shadowMap=Le,C.state=b,C.info=W}M!==Xt&&(T=new Jp(M,t.width,t.height,o,s,a));let ce=new ql(C,U);this.xr=ce,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let A=je.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=je.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(A){A!==void 0&&(te=A,this.setSize(Pe,J,!1))},this.getSize=function(A){return A.set(Pe,J)},this.setSize=function(A,G,K=!0){if(ce.isPresenting){Fe("WebGLRenderer: Can't change size while VR device is presenting.");return}Pe=A,J=G,t.width=Math.floor(A*te),t.height=Math.floor(G*te),K===!0&&(t.style.width=A+"px",t.style.height=G+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,A,G)},this.getDrawingBufferSize=function(A){return A.set(Pe*te,J*te).floor()},this.setDrawingBufferSize=function(A,G,K){Pe=A,J=G,te=K,t.width=Math.floor(A*K),t.height=Math.floor(G*K),this.setViewport(0,0,A,G)},this.setEffects=function(A){if(M===Xt){ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let G=0;G<A.length;G++)if(A[G].isOutputPass===!0){Fe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(F)},this.getViewport=function(A){return A.copy(pe)},this.setViewport=function(A,G,K,Y){A.isVector4?pe.set(A.x,A.y,A.z,A.w):pe.set(A,G,K,Y),b.viewport(F.copy(pe).multiplyScalar(te).round())},this.getScissor=function(A){return A.copy(Be)},this.setScissor=function(A,G,K,Y){A.isVector4?Be.set(A.x,A.y,A.z,A.w):Be.set(A,G,K,Y),b.scissor(re.copy(Be).multiplyScalar(te).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(A){b.setScissorTest(ot=A)},this.setOpaqueSort=function(A){ge=A},this.setTransparentSort=function(A){De=A},this.getClearColor=function(A){return A.copy(Ue.getClearColor())},this.setClearColor=function(){Ue.setClearColor(...arguments)},this.getClearAlpha=function(){return Ue.getClearAlpha()},this.setClearAlpha=function(){Ue.setClearAlpha(...arguments)},this.clear=function(A=!0,G=!0,K=!0){let Y=0;if(A){let $=!1;if(Z!==null){let _e=Z.texture.format;$=m.has(_e)}if($){let _e=Z.texture.type,Te=h.has(_e),ve=Ue.getClearColor(),Ce=Ue.getClearAlpha(),Ne=ve.r,We=ve.g,Ze=ve.b;Te?(S[0]=Ne,S[1]=We,S[2]=Ze,S[3]=Ce,U.clearBufferuiv(U.COLOR,0,S)):(E[0]=Ne,E[1]=We,E[2]=Ze,E[3]=Ce,U.clearBufferiv(U.COLOR,0,E))}else Y|=U.COLOR_BUFFER_BIT}G&&(Y|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),K&&(Y|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y!==0&&U.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),L=A},this.dispose=function(){t.removeEventListener("webglcontextlost",qe,!1),t.removeEventListener("webglcontextrestored",ze,!1),t.removeEventListener("webglcontextcreationerror",lt,!1),Ue.dispose(),fe.dispose(),ue.dispose(),X.dispose(),oe.dispose(),ne.dispose(),he.dispose(),ie.dispose(),le.dispose(),ce.dispose(),ce.removeEventListener("sessionstart",Ft),ce.removeEventListener("sessionend",aa),mn.stop()};function qe(A){A.preventDefault(),bl("WebGLRenderer: Context Lost."),N=!0}function ze(){bl("WebGLRenderer: Context Restored."),N=!1;let A=W.autoReset,G=Le.enabled,K=Le.autoUpdate,Y=Le.needsUpdate,$=Le.type;be(),W.autoReset=A,Le.enabled=G,Le.autoUpdate=K,Le.needsUpdate=Y,Le.type=$}function lt(A){ke("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function mt(A){let G=A.target;G.removeEventListener("dispose",mt),hi(G)}function hi(A){nn(A),X.remove(A)}function nn(A){let G=X.get(A).programs;G!==void 0&&(G.forEach(function(K){le.releaseProgram(K)}),A.isShaderMaterial&&le.releaseShaderCache(A))}this.renderBufferDirect=function(A,G,K,Y,$,_e){G===null&&(G=_t);let Te=$.isMesh&&$.matrixWorld.determinantAffine()<0,ve=po(A,G,K,Y,$);b.setMaterial(Y,Te);let Ce=K.index,Ne=1;if(Y.wireframe===!0){if(Ce=ee.getWireframeAttribute(K),Ce===void 0)return;Ne=2}let We=K.drawRange,Ze=K.attributes.position,Re=We.start*Ne,st=(We.start+We.count)*Ne;_e!==null&&(Re=Math.max(Re,_e.start*Ne),st=Math.min(st,(_e.start+_e.count)*Ne)),Ce!==null?(Re=Math.max(Re,0),st=Math.min(st,Ce.count)):Ze!=null&&(Re=Math.max(Re,0),st=Math.min(st,Ze.count));let bt=st-Re;if(bt<0||bt===1/0)return;he.setup($,Y,ve,K,Ce);let ft,dt=j;if(Ce!==null&&(ft=de.get(Ce),dt=q,dt.setIndex(ft)),$.isMesh)Y.wireframe===!0?(b.setLineWidth(Y.wireframeLinewidth*ye()),dt.setMode(U.LINES)):dt.setMode(U.TRIANGLES);else if($.isLine){let Rt=Y.linewidth;Rt===void 0&&(Rt=1),b.setLineWidth(Rt*ye()),$.isLineSegments?dt.setMode(U.LINES):$.isLineLoop?dt.setMode(U.LINE_LOOP):dt.setMode(U.LINE_STRIP)}else $.isPoints?dt.setMode(U.POINTS):$.isSprite&&dt.setMode(U.TRIANGLES);if($.isBatchedMesh)if(je.get("WEBGL_multi_draw"))dt.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{let Rt=$._multiDrawStarts,we=$._multiDrawCounts,Ot=$._multiDrawCount,et=Ce?de.get(Ce).bytesPerElement:1,jt=X.get(Y).currentProgram.getUniforms();for(let gn=0;gn<Ot;gn++)jt.setValue(U,"_gl_DrawID",gn),dt.render(Rt[gn]/et,we[gn])}else if($.isInstancedMesh)dt.renderInstances(Re,bt,$.count);else if(K.isInstancedBufferGeometry){let Rt=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,we=Math.min(K.instanceCount,Rt);dt.renderInstances(Re,bt,we)}else dt.render(Re,bt)};function fn(A,G,K,Y){L!==null&&A.isNodeMaterial&&L.setObject(Y,A),He===!0&&Ee.setState(A,K,!1),A.transparent===!0&&A.side===Dt&&A.forceSinglePass===!1?(A.side=kt,A.needsUpdate=!0,fi(A,G,Y),A.side=Zn,A.needsUpdate=!0,fi(A,G,Y),A.side=Dt):fi(A,G,Y)}this.compile=function(A,G,K=null){K===null&&(K=A),L!==null&&L.renderStart(A,G,K),_=ue.get(K),_.init(G),v.push(_),K.traverseVisible(function($){$.isLight&&$.layers.test(G.layers)&&(_.pushLight($),$.castShadow&&_.pushShadow($))}),A!==K&&A.traverseVisible(function($){$.isLight&&$.layers.test(G.layers)&&(_.pushLight($),$.castShadow&&_.pushShadow($))}),_.setupLights(),L!==null&&L.updateLights(_.state.lightsArray),Qe=this.localClippingEnabled,He=Ee.init(this.clippingPlanes,Qe),He===!0&&Ee.setGlobalState(this.clippingPlanes,G),L!==null&&Le.render(_.state.shadowsArray,K,G);let Y=new Set;return A.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;let _e=$.material;if(_e)if(Array.isArray(_e))for(let Te=0;Te<_e.length;Te++){let ve=_e[Te];fn(ve,K,G,$),Y.add(ve)}else fn(_e,K,G,$),Y.add(_e)}),_=v.pop(),L!==null&&L.renderEnd(),Y},this.compileAsync=function(A,G,K=null){let Y=this.compile(A,G,K);return new Promise($=>{function _e(){if(Y.forEach(function(Te){let Ce=X.get(Te).currentProgram;(Ce===void 0||Ce.isReady())&&Y.delete(Te)}),Y.size===0){$(A);return}setTimeout(_e,10)}je.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let pn=null;function zt(A){pn&&pn(A)}function Ft(){mn.stop()}function aa(){mn.start()}let mn=new Ld;mn.setAnimationLoop(zt),typeof self<"u"&&mn.setContext(self),this.setAnimationLoop=function(A){pn=A,ce.setAnimationLoop(A),A===null?mn.stop():mn.start()},ce.addEventListener("sessionstart",Ft),ce.addEventListener("sessionend",aa),this.render=function(A,G){if(G!==void 0&&G.isCamera!==!0){ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;L!==null&&L.renderStart(A,G);let K=ce.enabled===!0&&ce.isPresenting===!0,Y=T!==null&&(Z===null||K)&&T.begin(C,Z);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),ce.enabled===!0&&ce.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(ce.cameraAutoUpdate===!0&&ce.updateCamera(G),G=ce.getCamera()),A.isScene===!0&&A.onBeforeRender(C,A,G,Z),_=ue.get(A,v.length),_.init(G),_.state.textureUnits=Q.getTextureUnits(),v.push(_),Oe.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),Ve.setFromProjectionMatrix(Oe,ln,G.reversedDepth),Qe=this.localClippingEnabled,He=Ee.init(this.clippingPlanes,Qe),g=fe.get(A,R.length),g.init(),R.push(g),ce.enabled===!0&&ce.isPresenting===!0){let Te=C.xr.getDepthSensingMesh();Te!==null&&is(Te,G,-1/0,C.sortObjects)}is(A,G,0,C.sortObjects),g.finish(),L!==null&&L.updateLights(_.state.lightsArray),C.sortObjects===!0&&g.sort(ge,De),Ke=ce.enabled===!1||ce.isPresenting===!1||ce.hasDepthSensing()===!1,Ke&&Ue.addToRenderList(g,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),He===!0&&Ee.beginShadows();let $=_.state.shadowsArray;if(Le.render($,A,G),He===!0&&Ee.endShadows(),(Y&&T.hasRenderPass())===!1){let Te=g.opaque,ve=g.transmissive;if(_.setupLights(),G.isArrayCamera){let Ce=G.cameras;if(ve.length>0)for(let Ne=0,We=Ce.length;Ne<We;Ne++){let Ze=Ce[Ne];oa(Te,ve,A,Ze)}Ke&&Ue.render(A);for(let Ne=0,We=Ce.length;Ne<We;Ne++){let Ze=Ce[Ne];ra(g,A,Ze,Ze.viewport)}}else ve.length>0&&oa(Te,ve,A,G),Ke&&Ue.render(A),ra(g,A,G)}Z!==null&&V===0&&(Q.updateMultisampleRenderTarget(Z),Q.updateRenderTargetMipmap(Z)),Y&&T.end(C),A.isScene===!0&&A.onAfterRender(C,A,G),he.resetDefaultState(),H=-1,B=null,v.pop(),v.length>0?(_=v[v.length-1],Q.setTextureUnits(_.state.textureUnits),He===!0&&Ee.setGlobalState(C.clippingPlanes,_.state.camera)):_=null,R.pop(),R.length>0?g=R[R.length-1]:g=null,L!==null&&L.renderEnd()};function is(A,G,K,Y){if(A.visible===!1)return;if(A.layers.test(G.layers)){if(A.isGroup)K=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(G);else if(A.isLightProbeGrid)_.pushLightProbeGrid(A);else if(A.isLight)_.pushLight(A),A.castShadow&&_.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||A.intersectsFrustum(Ve)){Y&&nt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Oe);let Te=ne.update(A),ve=A.material;ve.visible&&g.push(A,Te,ve,K,nt.z,null,G)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||A.intersectsFrustum(Ve))){let Te=ne.update(A),ve=A.material;if(Y&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),nt.copy(A.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),nt.copy(Te.boundingSphere.center)),nt.applyMatrix4(A.matrixWorld).applyMatrix4(Oe)),Array.isArray(ve)){let Ce=Te.groups;for(let Ne=0,We=Ce.length;Ne<We;Ne++){let Ze=Ce[Ne],Re=ve[Ze.materialIndex];Re&&Re.visible&&g.push(A,Te,Re,K,nt.z,Ze,G)}}else ve.visible&&g.push(A,Te,ve,K,nt.z,null,G)}}let _e=A.children;for(let Te=0,ve=_e.length;Te<ve;Te++)is(_e[Te],G,K,Y)}function ra(A,G,K,Y){let{opaque:$,transmissive:_e,transparent:Te}=A;_.setupLightsView(K),He===!0&&Ee.setGlobalState(C.clippingPlanes,K),Y&&b.viewport(F.copy(Y)),$.length>0&&ui($,G,K),_e.length>0&&ui(_e,G,K),Te.length>0&&ui(Te,G,K),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function oa(A,G,K,Y){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;if(_.state.transmissionRenderTarget[Y.id]===void 0){let Re=je.has("EXT_color_buffer_half_float")||je.has("EXT_color_buffer_float");_.state.transmissionRenderTarget[Y.id]=new Ht(1,1,{generateMipmaps:!0,type:Re?un:Xt,minFilter:Kn,samples:Math.max(4,I.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Je.workingColorSpace})}let _e=_.state.transmissionRenderTarget[Y.id],Te=Y.viewport||F;_e.setSize(Te.z*C.transmissionResolutionScale,Te.w*C.transmissionResolutionScale);let ve=C.getRenderTarget(),Ce=C.getActiveCubeFace(),Ne=C.getActiveMipmapLevel();C.setRenderTarget(_e),C.getClearColor(Ie),Me=C.getClearAlpha(),Me<1&&C.setClearColor(16777215,.5),C.clear(),Ke&&Ue.render(K);let We=C.toneMapping;C.toneMapping=cn;let Ze=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),_.setupLightsView(Y),He===!0&&Ee.setGlobalState(C.clippingPlanes,Y),ui(A,K,Y),Q.updateMultisampleRenderTarget(_e),Q.updateRenderTargetMipmap(_e),je.has("WEBGL_multisampled_render_to_texture")===!1){let Re=!1;for(let st=0,bt=G.length;st<bt;st++){let ft=G[st],{object:dt,geometry:Rt,material:we,group:Ot}=ft;if(we.side===Dt&&dt.layers.test(Y.layers)){let et=we.side;we.side=kt,we.needsUpdate=!0,la(dt,K,Y,Rt,we,Ot),we.side=et,we.needsUpdate=!0,Re=!0}}Re===!0&&(Q.updateMultisampleRenderTarget(_e),Q.updateRenderTargetMipmap(_e))}C.setRenderTarget(ve,Ce,Ne),C.setClearColor(Ie,Me),Ze!==void 0&&(Y.viewport=Ze),C.toneMapping=We}function ui(A,G,K){let Y=G.isScene===!0?G.overrideMaterial:null;for(let $=0,_e=A.length;$<_e;$++){let Te=A[$],{object:ve,geometry:Ce,group:Ne}=Te,We=Te.material;We.allowOverride===!0&&Y!==null&&(We=Y),ve.layers.test(K.layers)&&la(ve,G,K,Ce,We,Ne)}}function la(A,G,K,Y,$,_e){L!==null&&$.isNodeMaterial&&L.setObject(A,$),A.onBeforeRender(C,G,K,Y,$,_e),A.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),$.onBeforeRender(C,G,K,Y,A,_e),$.transparent===!0&&$.side===Dt&&$.forceSinglePass===!1?($.side=kt,$.needsUpdate=!0,C.renderBufferDirect(K,G,Y,$,A,_e),$.side=Zn,$.needsUpdate=!0,C.renderBufferDirect(K,G,Y,$,A,_e),$.side=Dt):C.renderBufferDirect(K,G,Y,$,A,_e),A.onAfterRender(C,G,K,Y,$,_e)}function fi(A,G,K){G.isScene!==!0&&(G=_t);let Y=X.get(A),$=_.state.lights,_e=_.state.shadowsArray,Te=$.state.version,ve=le.getParameters(A,$.state,_e,G,K,_.state.lightProbeGridArray),Ce=le.getProgramCacheKey(ve),Ne=Y.programs;Y.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?G.environment:null,Y.fog=G.fog;let We=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;Y.envMap=oe.get(A.envMap||Y.environment,We),Y.envMapRotation=Y.environment!==null&&A.envMap===null?G.environmentRotation:A.envMapRotation,Ne===void 0&&(A.addEventListener("dispose",mt),Ne=new Map,Y.programs=Ne);let Ze=Ne.get(Ce);if(Ze!==void 0){if(Y.currentProgram===Ze&&Y.lightsStateVersion===Te)return ca(A,ve),Ze}else ve.uniforms=le.getUniforms(A),L!==null&&A.isNodeMaterial&&L.build(A,K,ve),A.onBeforeCompile(ve,C),Ze=le.acquireProgram(ve,Ce),Ne.set(Ce,Ze),Y.uniforms=ve.uniforms;let Re=Y.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Re.clippingPlanes=Ee.uniform),ca(A,ve),Y.needsLights=ut(A),Y.lightsStateVersion=Te,Y.needsLights&&(Re.ambientLightColor.value=$.state.ambient,Re.lightProbe.value=$.state.probe,Re.sunLights.value=$.state.sun,Re.sunLightShadows.value=$.state.sunShadow,Re.directionalLights.value=$.state.directional,Re.directionalLightShadows.value=$.state.directionalShadow,Re.spotLights.value=$.state.spot,Re.spotLightShadows.value=$.state.spotShadow,Re.rectAreaLights.value=$.state.rectArea,Re.ltc_1.value=$.state.rectAreaLTC1,Re.ltc_2.value=$.state.rectAreaLTC2,Re.pointLights.value=$.state.point,Re.pointLightShadows.value=$.state.pointShadow,Re.hemisphereLights.value=$.state.hemi,Re.sunShadowMatrix.value=$.state.sunShadowMatrix,Re.sunShadowCascade.value=$.state.sunShadowCascade,Re.directionalShadowMatrix.value=$.state.directionalShadowMatrix,Re.spotLightMatrix.value=$.state.spotLightMatrix,Re.spotLightMap.value=$.state.spotLightMap,Re.pointShadowMatrix.value=$.state.pointShadowMatrix),Y.lightProbeGrid=_.state.lightProbeGridArray.length>0,Y.currentProgram=Ze,Y.uniformsList=null,Ze}function ss(A){if(A.uniformsList===null){let G=A.currentProgram.getUniforms();A.uniformsList=ts.seqWithValue(G.seq,A.uniforms)}return A.uniformsList}function ca(A,G){let K=X.get(A);K.outputColorSpace=G.outputColorSpace,K.batching=G.batching,K.batchingColor=G.batchingColor,K.instancing=G.instancing,K.instancingColor=G.instancingColor,K.instancingMorph=G.instancingMorph,K.skinning=G.skinning,K.morphTargets=G.morphTargets,K.morphNormals=G.morphNormals,K.morphColors=G.morphColors,K.morphTargetsCount=G.morphTargetsCount,K.numClippingPlanes=G.numClippingPlanes,K.numIntersection=G.numClipIntersection,K.vertexAlphas=G.vertexAlphas,K.vertexTangents=G.vertexTangents,K.toneMapping=G.toneMapping}function fo(A,G){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;y.setFromMatrixPosition(G.matrixWorld);for(let K=0,Y=A.length;K<Y;K++){let $=A[K];if($.texture!==null&&$.boundingBox.containsPoint(y))return $}return null}function po(A,G,K,Y,$){G.isScene!==!0&&(G=_t),Q.resetTextureUnits();let _e=G.fog,Te=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial?G.environment:null,ve=Z===null?C.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:Je.workingColorSpace,Ce=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial&&!Y.envMap||Y.isMeshPhongMaterial&&!Y.envMap,Ne=oe.get(Y.envMap||Te,Ce),We=Y.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,Ze=!!K.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Re=!!K.morphAttributes.position,st=!!K.morphAttributes.normal,bt=!!K.morphAttributes.color,ft=cn;Y.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(ft=C.toneMapping);let dt=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Rt=dt!==void 0?dt.length:0,we=X.get(Y),Ot=_.state.lights;if(He===!0&&(Qe===!0||A!==B)){let ht=A===B&&Y.id===H;Ee.setState(Y,A,ht)}let et=!1;Y.version===we.__version?(we.needsLights&&we.lightsStateVersion!==Ot.state.version||we.outputColorSpace!==ve||$.isBatchedMesh&&we.batching===!1||!$.isBatchedMesh&&we.batching===!0||$.isBatchedMesh&&we.batchingColor===!0&&$._colorsTexture===null||$.isBatchedMesh&&we.batchingColor===!1&&$._colorsTexture!==null||$.isInstancedMesh&&we.instancing===!1||!$.isInstancedMesh&&we.instancing===!0||$.isSkinnedMesh&&we.skinning===!1||!$.isSkinnedMesh&&we.skinning===!0||$.isInstancedMesh&&we.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&we.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&we.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&we.instancingMorph===!1&&$.morphTexture!==null||we.envMap!==Ne||Y.fog===!0&&we.fog!==_e||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==Ee.numPlanes||we.numIntersection!==Ee.numIntersection)||we.vertexAlphas!==We||we.vertexTangents!==Ze||we.morphTargets!==Re||we.morphNormals!==st||we.morphColors!==bt||we.toneMapping!==ft||we.morphTargetsCount!==Rt||!!we.lightProbeGrid!=_.state.lightProbeGridArray.length>0)&&(et=!0):(et=!0,we.__version=Y.version);let jt=we.currentProgram;et===!0&&(jt=fi(Y,G,$),L&&Y.isNodeMaterial&&L.onUpdateProgram(Y,jt,we));let gn=!1,Dn=!1,pi=!1,ct=jt.getUniforms(),yt=we.uniforms;if(b.useProgram(jt.program)&&(gn=!0,Dn=!0,pi=!0),Y.id!==H&&(H=Y.id,Dn=!0),we.needsLights){let ht=fo(_.state.lightProbeGridArray,$);we.lightProbeGrid!==ht&&(we.lightProbeGrid=ht,Dn=!0)}if(gn||B!==A){b.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),ct.setValue(U,"projectionMatrix",A.projectionMatrix),ct.setValue(U,"viewMatrix",A.matrixWorldInverse);let Fn=ct.map.cameraPosition;Fn!==void 0&&Fn.setValue(U,tt.setFromMatrixPosition(A.matrixWorld)),I.logarithmicDepthBuffer&&ct.setValue(U,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&ct.setValue(U,"isOrthographic",A.isOrthographicCamera===!0),B!==A&&(B=A,Dn=!0,pi=!0)}if(we.needsLights&&(Ot.state.sunShadowMap.length>0&&ct.setValue(U,"sunShadowMap",Ot.state.sunShadowMap,Q),Ot.state.directionalShadowMap.length>0&&ct.setValue(U,"directionalShadowMap",Ot.state.directionalShadowMap,Q),Ot.state.spotShadowMap.length>0&&ct.setValue(U,"spotShadowMap",Ot.state.spotShadowMap,Q),Ot.state.pointShadowMap.length>0&&ct.setValue(U,"pointShadowMap",Ot.state.pointShadowMap,Q)),$.isSkinnedMesh){ct.setOptional(U,$,"bindMatrix"),ct.setOptional(U,$,"bindMatrixInverse");let ht=$.skeleton;ht&&(ht.boneTexture===null&&ht.computeBoneTexture(),ct.setValue(U,"boneTexture",ht.boneTexture,Q))}$.isBatchedMesh&&(ct.setOptional(U,$,"batchingTexture"),ct.setValue(U,"batchingTexture",$._matricesTexture,Q),ct.setOptional(U,$,"batchingIdTexture"),ct.setValue(U,"batchingIdTexture",$._indirectTexture,Q),ct.setOptional(U,$,"batchingColorTexture"),$._colorsTexture!==null&&ct.setValue(U,"batchingColorTexture",$._colorsTexture,Q));let Un=K.morphAttributes;if((Un.position!==void 0||Un.normal!==void 0||Un.color!==void 0)&&z.update($,K,jt),(Dn||we.receiveShadow!==$.receiveShadow)&&(we.receiveShadow=$.receiveShadow,ct.setValue(U,"receiveShadow",$.receiveShadow)),(Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial)&&Y.envMap===null&&G.environment!==null&&(yt.envMapIntensity.value=G.environmentIntensity),yt.dfgLUT!==void 0&&(yt.dfgLUT.value=Fg()),Dn){if(ct.setValue(U,"toneMappingExposure",C.toneMappingExposure),we.needsLights&&Se(yt,pi),_e&&Y.fog===!0&&Ae.refreshFogUniforms(yt,_e),Ae.refreshMaterialUniforms(yt,Y,te,J,_.state.transmissionRenderTarget[A.id]),we.needsLights&&we.lightProbeGrid){let ht=we.lightProbeGrid;yt.probesSH.value=ht.texture,yt.probesMin.value.copy(ht.boundingBox.min),yt.probesMax.value.copy(ht.boundingBox.max),yt.probesResolution.value.copy(ht.resolution)}ts.upload(U,ss(we),yt,Q)}if(Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(ts.upload(U,ss(we),yt,Q),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&ct.setValue(U,"center",$.center),ct.setValue(U,"modelViewMatrix",$.modelViewMatrix),ct.setValue(U,"normalMatrix",$.normalMatrix),ct.setValue(U,"modelMatrix",$.matrixWorld),Y.uniformsGroups!==void 0){let ht=Y.uniformsGroups;for(let Fn=0,mi=ht.length;Fn<mi;Fn++){let Yl=ht[Fn];ie.update(Yl,jt),ie.bind(Yl,jt)}}return jt}function Se(A,G){A.ambientLightColor.needsUpdate=G,A.lightProbe.needsUpdate=G,A.sunLights.needsUpdate=G,A.sunLightShadows.needsUpdate=G,A.directionalLights.needsUpdate=G,A.directionalLightShadows.needsUpdate=G,A.pointLights.needsUpdate=G,A.pointLightShadows.needsUpdate=G,A.spotLights.needsUpdate=G,A.spotLightShadows.needsUpdate=G,A.rectAreaLights.needsUpdate=G,A.hemisphereLights.needsUpdate=G}function ut(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return Z},this.setRenderTargetTextures=function(A,G,K){let Y=X.get(A);Y.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,Y.__autoAllocateDepthBuffer===!1&&(Y.__useRenderToTexture=!1),X.get(A.texture).__webglTexture=G,X.get(A.depthTexture).__webglTexture=Y.__autoAllocateDepthBuffer?void 0:K,Y.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,G){let K=X.get(A);K.__webglFramebuffer=G,K.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(A,G=0,K=0){Z=A,P=G,V=K;let Y=null,$=!1,_e=!1;if(A){let ve=X.get(A);if(ve.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(U.FRAMEBUFFER,ve.__webglFramebuffer),F.copy(A.viewport),re.copy(A.scissor),ae=A.scissorTest,b.viewport(F),b.scissor(re),b.setScissorTest(ae),H=-1;return}else if(ve.__webglFramebuffer===void 0)Q.setupRenderTarget(A);else if(ve.__hasExternalTextures)Q.rebindTextures(A,X.get(A.texture).__webglTexture,X.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let We=A.depthTexture;if(ve.__boundDepthTexture!==We){if(We!==null&&X.has(We)&&(A.width!==We.image.width||A.height!==We.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Q.setupDepthRenderbuffer(A)}}let Ce=A.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(_e=!0);let Ne=X.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ne[G])?Y=Ne[G][K]:Y=Ne[G],$=!0):A.samples>0&&Q.useMultisampledRTT(A)===!1?Y=X.get(A).__webglMultisampledFramebuffer:Array.isArray(Ne)?Y=Ne[K]:Y=Ne,F.copy(A.viewport),re.copy(A.scissor),ae=A.scissorTest}else F.copy(pe).multiplyScalar(te).floor(),re.copy(Be).multiplyScalar(te).floor(),ae=ot;if(K!==0&&(Y=O),b.bindFramebuffer(U.FRAMEBUFFER,Y)&&b.drawBuffers(A,Y),b.viewport(F),b.scissor(re),b.setScissorTest(ae),$){let ve=X.get(A.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+G,ve.__webglTexture,K)}else if(_e){let ve=G;for(let Ce=0;Ce<A.textures.length;Ce++){let Ne=X.get(A.textures[Ce]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ce,Ne.__webglTexture,K,ve)}}else if(A!==null&&K!==0){let ve=X.get(A.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ve.__webglTexture,K)}H=-1};function qt(A){let G=X.get(A);return(G.__readFormat!==A.format||G.__readType!==A.type)&&(G.__readFormat=A.format,G.__readType=A.type,G.__formatReadable=I.textureFormatReadable(A.format),G.__typeReadable=I.textureTypeReadable(A.type)),G}this.readRenderTargetPixels=function(A,G,K,Y,$,_e,Te,ve=0){if(!(A&&A.isWebGLRenderTarget)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=X.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce){b.bindFramebuffer(U.FRAMEBUFFER,Ce);try{let Ne=A.textures[ve],We=Ne.format,Ze=Ne.type;A.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ve);let Re=qt(Ne);if(Re.__formatReadable===!1){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Re.__typeReadable===!1){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=A.width-Y&&K>=0&&K<=A.height-$&&U.readPixels(G,K,Y,$,se.convert(We),se.convert(Ze),_e)}finally{let Ne=Z!==null?X.get(Z).__webglFramebuffer:null;b.bindFramebuffer(U.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(A,G,K,Y,$,_e,Te,ve=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=X.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce)if(G>=0&&G<=A.width-Y&&K>=0&&K<=A.height-$){b.bindFramebuffer(U.FRAMEBUFFER,Ce);let Ne=A.textures[ve],We=Ne.format,Ze=Ne.type;A.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ve);let Re=qt(Ne);if(Re.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Re.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let st=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,st),U.bufferData(U.PIXEL_PACK_BUFFER,_e.byteLength,U.STREAM_READ),U.readPixels(G,K,Y,$,se.convert(We),se.convert(Ze),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let bt=Z!==null?X.get(Z).__webglFramebuffer:null;b.bindFramebuffer(U.FRAMEBUFFER,bt);let ft=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await nd(U,ft,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,st),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,_e),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(st),U.deleteSync(ft),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,G=null,K=0){let Y=Math.pow(2,-K),$=Math.floor(A.image.width*Y),_e=Math.floor(A.image.height*Y),Te=G!==null?G.x:0,ve=G!==null?G.y:0;Q.setTexture2D(A,0),U.copyTexSubImage2D(U.TEXTURE_2D,K,0,0,Te,ve,$,_e),b.unbindTexture()},this.copyTextureToTexture=function(A,G,K=null,Y=null,$=0,_e=0){let Te,ve,Ce,Ne,We,Ze,Re,st,bt,ft=A.isCompressedTexture?A.mipmaps[_e]:A.image;if(K!==null)Te=K.max.x-K.min.x,ve=K.max.y-K.min.y,Ce=K.isBox3?K.max.z-K.min.z:1,Ne=K.min.x,We=K.min.y,Ze=K.isBox3?K.min.z:0;else{let yt=Math.pow(2,-$);Te=Math.floor(ft.width*yt),ve=Math.floor(ft.height*yt),A.isDataArrayTexture?Ce=ft.depth:A.isData3DTexture?Ce=Math.floor(ft.depth*yt):Ce=1,Ne=0,We=0,Ze=0}Y!==null?(Re=Y.x,st=Y.y,bt=Y.z):(Re=0,st=0,bt=0);let dt=se.convert(G.format),Rt=se.convert(G.type),we;G.isData3DTexture?(Q.setTexture3D(G,0),we=U.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(Q.setTexture2DArray(G,0),we=U.TEXTURE_2D_ARRAY):(Q.setTexture2D(G,0),we=U.TEXTURE_2D),b.activeTexture(U.TEXTURE0),b.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,G.flipY),b.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),b.pixelStorei(U.UNPACK_ALIGNMENT,G.unpackAlignment);let Ot=b.getParameter(U.UNPACK_ROW_LENGTH),et=b.getParameter(U.UNPACK_IMAGE_HEIGHT),jt=b.getParameter(U.UNPACK_SKIP_PIXELS),gn=b.getParameter(U.UNPACK_SKIP_ROWS),Dn=b.getParameter(U.UNPACK_SKIP_IMAGES);b.pixelStorei(U.UNPACK_ROW_LENGTH,ft.width),b.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ft.height),b.pixelStorei(U.UNPACK_SKIP_PIXELS,Ne),b.pixelStorei(U.UNPACK_SKIP_ROWS,We),b.pixelStorei(U.UNPACK_SKIP_IMAGES,Ze);let pi=A.isDataArrayTexture||A.isData3DTexture,ct=G.isDataArrayTexture||G.isData3DTexture;if(A.isDepthTexture){let yt=X.get(A),Un=X.get(G),ht=X.get(yt.__renderTarget),Fn=X.get(Un.__renderTarget);b.bindFramebuffer(U.READ_FRAMEBUFFER,ht.__webglFramebuffer),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,Fn.__webglFramebuffer);for(let mi=0;mi<Ce;mi++)pi&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,X.get(A).__webglTexture,$,Ze+mi),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,X.get(G).__webglTexture,_e,bt+mi)),U.blitFramebuffer(Ne,We,Te,ve,Re,st,Te,ve,U.DEPTH_BUFFER_BIT,U.NEAREST);b.bindFramebuffer(U.READ_FRAMEBUFFER,null),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if($!==0||A.isRenderTargetTexture||X.has(A)){let yt=X.get(A),Un=X.get(G);b.bindFramebuffer(U.READ_FRAMEBUFFER,w),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,D);for(let ht=0;ht<Ce;ht++)pi?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,yt.__webglTexture,$,Ze+ht):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,yt.__webglTexture,$),ct?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Un.__webglTexture,_e,bt+ht):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Un.__webglTexture,_e),$!==0?U.blitFramebuffer(Ne,We,Te,ve,Re,st,Te,ve,U.COLOR_BUFFER_BIT,U.NEAREST):ct?U.copyTexSubImage3D(we,_e,Re,st,bt+ht,Ne,We,Te,ve):U.copyTexSubImage2D(we,_e,Re,st,Ne,We,Te,ve);b.bindFramebuffer(U.READ_FRAMEBUFFER,null),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ct?A.isDataTexture||A.isData3DTexture?U.texSubImage3D(we,_e,Re,st,bt,Te,ve,Ce,dt,Rt,ft.data):G.isCompressedArrayTexture?U.compressedTexSubImage3D(we,_e,Re,st,bt,Te,ve,Ce,dt,ft.data):U.texSubImage3D(we,_e,Re,st,bt,Te,ve,Ce,dt,Rt,ft):A.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,_e,Re,st,Te,ve,dt,Rt,ft.data):A.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,_e,Re,st,ft.width,ft.height,dt,ft.data):U.texSubImage2D(U.TEXTURE_2D,_e,Re,st,Te,ve,dt,Rt,ft);b.pixelStorei(U.UNPACK_ROW_LENGTH,Ot),b.pixelStorei(U.UNPACK_IMAGE_HEIGHT,et),b.pixelStorei(U.UNPACK_SKIP_PIXELS,jt),b.pixelStorei(U.UNPACK_SKIP_ROWS,gn),b.pixelStorei(U.UNPACK_SKIP_IMAGES,Dn),_e===0&&G.generateMipmaps&&U.generateMipmap(we),b.unbindTexture()},this.initRenderTarget=function(A){X.get(A).__webglFramebuffer===void 0&&Q.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?Q.setTextureCube(A,0):A.isData3DTexture?Q.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?Q.setTexture2DArray(A,0):Q.setTexture2D(A,0),b.unbindTexture()},this.resetState=function(){P=0,V=0,Z=null,b.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ln}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}};(function(){let{useState:i,useEffect:e,useRef:t}=React,{Card:n,SectionTitle:s,Badge:a,Icon:r,Segmented:o,Spinner:l,Empty:c,ProgressRing:f,Modal:p}=window.CG.UI,{ProbBars:u,BarChart:d}=window.CG.Charts;function x(){let{t:g,lang:_,toast:R,user:v}=window.CG.Store.useStore(),[T,C]=i("plant"),[N,L]=i(null),[O,w]=i(null),[D,P]=i(null),[V,Z]=i(null),[H,B]=i(!1),[F,re]=i(null),[ae,Ie]=i([]),[Me,Pe]=i(""),[J,te]=i(!1),[ge,De]=i(!1),[pe,Be]=i(!1),ot=t(null),Ve=t(null),He=t(null);e(()=>{window.CG.API_CLIENT.fields().then(Ie).catch(()=>{})},[]);let Qe=ye=>{if(ye)if(L(ye),re(null),ye.type.startsWith("image/")){let U=URL.createObjectURL(ye);w(U)}else w(null)},Oe=()=>{L(null),w(null),P(null),Z(null),re(null),He.current?.scrollIntoView({behavior:"smooth",block:"start"})},tt=()=>{Be(!0),He.current?.scrollIntoView({behavior:"smooth",block:"start"})},nt=async()=>{if(!N){R(_==="th"?"\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C":"Please choose a file","warn");return}let ye=T==="csv"||N.name.toLowerCase().endsWith(".csv");B(!0),re(null);try{let U=ye?await window.CG.API_CLIENT.predictCsv(N,Me||null):D?await window.CG.API_CLIENT.predictImages([{file:N,source:T},{file:D,source:"plant"}],Me||null):await window.CG.API_CLIENT.predictImage(N,T,Me||null);re(U),R(_==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08":"Analysis complete","success")}catch(U){R(U.message,"error")}finally{B(!1)}};e(()=>{N&&T!=="csv"&&!H&&!F&&nt()},[N]);let _t=[{value:"leaf",label:g("src_leaf")},{value:"plant",label:g("src_plant")},{value:"canopy",label:g("src_canopy")},{value:"csv",label:g("src_csv")}],Ke=F?3:N||H?2:1;return React.createElement("div",{className:"space-y-6 max-w-6xl mx-auto diagnosis-workspace"},React.createElement("section",{className:"diagnosis-intro animate-fadeup"},React.createElement("div",null,React.createElement("span",{className:"diagnosis-kicker"},React.createElement(r,{name:"leaf",className:"w-4 h-4"})," CASSAVAGUARD VISION"),React.createElement("h1",{className:"txt"},_==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E40\u0E14\u0E35\u0E22\u0E27":"Understand cassava health from one photo"),React.createElement("p",{className:"txt-soft"},_==="th"?"\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07 \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E42\u0E14\u0E22\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E38\u0E14\u0E2B\u0E31\u0E27":"Photograph the standing plant to analyze health and estimate a non-destructive yield range.")),React.createElement("div",{className:"diagnosis-trust"},React.createElement("span",null,React.createElement(r,{name:"check",className:"w-4 h-4"}),_==="th"?"\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A":"No sign-in"),React.createElement("span",null,React.createElement(r,{name:"cpu",className:"w-4 h-4"}),_==="th"?"\u0E42\u0E21\u0E40\u0E14\u0E25 5 \u0E04\u0E25\u0E32\u0E2A":"5-class model"))),React.createElement("ol",{className:"workflow-steps","aria-label":_==="th"?"\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Analysis steps"},[[1,"camera",_==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E39\u0E1B":"Add photo"],[2,"brain",_==="th"?"\u0E1B\u0E23\u0E30\u0E21\u0E27\u0E25\u0E1C\u0E25\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34":"Auto analyze"],[3,"leaf",_==="th"?"\u0E14\u0E39\u0E1C\u0E25\u0E41\u0E25\u0E30 3D":"Result & 3D"]].map(([ye,U,it])=>React.createElement("li",{key:ye,className:Ke>=ye?"active":""},React.createElement("span",null,React.createElement(r,{name:U,className:"w-4 h-4"})),React.createElement("b",null,it),ye<3&&React.createElement("i",null)))),React.createElement("div",{className:"diagnosis-tip"},React.createElement(r,{name:"camera",className:"w-5 h-5"}),React.createElement("span",null,_==="th"?"\u0E40\u0E04\u0E25\u0E47\u0E14\u0E25\u0E31\u0E1A: \u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E49\u0E40\u0E2B\u0E47\u0E19\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E15\u0E31\u0E49\u0E07\u0E41\u0E15\u0E48\u0E42\u0E04\u0E19\u0E16\u0E36\u0E07\u0E22\u0E2D\u0E14 \u0E21\u0E35\u0E27\u0E31\u0E15\u0E16\u0E38\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E02\u0E19\u0E32\u0E14 \u0E41\u0E25\u0E30\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E22\u0E49\u0E2D\u0E19\u0E41\u0E2A\u0E07":"Tip: Show the whole plant from base to canopy, include a scale reference, and avoid backlight.")),React.createElement("div",{className:`grid gap-4 ${F||H?"lg:grid-cols-5":""}`},React.createElement(n,{className:`${F||H?"lg:col-span-2":"max-w-3xl w-full mx-auto"} animate-fadeup capture-card`},React.createElement("div",{ref:He},React.createElement("div",{className:"flex items-center justify-between gap-3 mb-4"},React.createElement("div",null,React.createElement("div",{className:"txt font-bold text-lg"},N?_==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E":"Check your photo":_==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E39\u0E1B\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21":"Choose a photo to begin"),React.createElement("div",{className:"txt-dim text-sm mt-0.5"},_==="th"?"JPG \u0E2B\u0E23\u0E37\u0E2D PNG \u2022 \u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19\u0E09\u0E1A\u0E31\u0E1A\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E1F\u0E34\u0E25\u0E40\u0E15\u0E2D\u0E23\u0E4C":"JPG or PNG \u2022 use an original, unfiltered photo")),React.createElement(a,{tone:"green"},"1 ",_==="th"?"\u0E23\u0E39\u0E1B":"photo")),React.createElement("div",{onDragOver:ye=>{ye.preventDefault(),te(!0)},onDragLeave:()=>te(!1),onDrop:ye=>{ye.preventDefault(),te(!1),Qe(ye.dataTransfer.files[0])},onClick:()=>ot.current.click(),className:`capture-zone cursor-pointer ${J?"is-dragging":""} ${O?"has-preview":""}`},O?React.createElement("img",{src:O,alt:_==="th"?"\u0E23\u0E39\u0E1B\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Selected photo for analysis",className:"max-h-[350px] w-full rounded-2xl object-contain"}):N?React.createElement("div",{className:"txt-soft"},React.createElement(r,{name:"soil",className:"w-10 h-10 mx-auto mb-2 text-brand-400"}),React.createElement("div",{className:"txt font-medium text-sm"},N.name)):React.createElement("div",{className:"txt-dim"},React.createElement("div",{className:"capture-orb"},React.createElement(r,{name:"camera",className:"w-9 h-9"}),React.createElement("span",{className:"capture-orb-ring"})),React.createElement("div",{className:"txt text-xl font-extrabold"},_==="th"?"\u0E41\u0E15\u0E30\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E39\u0E1B\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"Tap to choose a whole-plant photo"),React.createElement("div",{className:"txt-dim text-sm mt-2"},_==="th"?"\u0E2B\u0E23\u0E37\u0E2D\u0E25\u0E32\u0E01\u0E23\u0E39\u0E1B\u0E21\u0E32\u0E27\u0E32\u0E07\u0E15\u0E23\u0E07\u0E19\u0E35\u0E49":"or drag and drop it here")),React.createElement("input",{ref:ot,type:"file",className:"hidden",accept:T==="csv"?".csv":"image/*",onChange:ye=>Qe(ye.target.files[0])})),T!=="csv"&&React.createElement("div",{className:"grid sm:grid-cols-2 gap-3 mt-4"},React.createElement("button",{onClick:()=>De(!0),className:"primary-action"},React.createElement(r,{name:"camera",className:"w-5 h-5"}),g("take_photo")),React.createElement("button",{onClick:()=>ot.current.click(),className:"secondary-action"},React.createElement(r,{name:"upload",className:"w-5 h-5"}),g("upload_file"))),T==="leaf"&&N&&React.createElement("div",{className:"evidence-panel mt-4"},React.createElement("div",{className:"flex items-center justify-between gap-3"},React.createElement("div",null,React.createElement("div",{className:"txt text-sm font-bold"},_==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1C\u0E25\u0E17\u0E35\u0E48\u0E23\u0E2D\u0E1A\u0E14\u0E49\u0E32\u0E19\u0E02\u0E36\u0E49\u0E19":"Add a whole-plant view for stronger evidence"),React.createElement("p",{className:"txt-dim text-xs mt-1"},_==="th"?"\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E23\u0E27\u0E21\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E43\u0E1A\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E15\u0E23\u0E27\u0E08\u0E27\u0E48\u0E32\u0E1C\u0E25\u0E15\u0E23\u0E07\u0E01\u0E31\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48":"We fuse leaf and plant probabilities and report whether the views agree.")),React.createElement(a,{tone:D?"low":"slate"},D?"2/2":"1/2")),D?React.createElement("div",{className:"evidence-photo mt-3"},React.createElement("img",{src:V,alt:_==="th"?"\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Whole cassava plant"}),React.createElement("div",null,React.createElement("strong",{className:"txt text-sm block"},_==="th"?"\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E25\u0E49\u0E27":"Whole-plant view ready"),React.createElement("span",{className:"txt-dim text-xs block truncate max-w-[210px]"},D.name)),React.createElement("button",{onClick:()=>{P(null),Z(null)},"aria-label":_==="th"?"\u0E25\u0E1A\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19":"Remove plant photo"},React.createElement(r,{name:"close",className:"w-4 h-4"}))):React.createElement("button",{type:"button",onClick:()=>Ve.current?.click(),className:"add-evidence-button mt-3"},React.createElement(r,{name:"plus",className:"w-4 h-4"}),_==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"Add whole-plant photo"),React.createElement("input",{ref:Ve,type:"file",className:"hidden",accept:"image/*",onChange:ye=>{let U=ye.target.files?.[0];U&&(P(U),Z(URL.createObjectURL(U)),re(null))}})),React.createElement("div",{className:"mt-3"},React.createElement("button",{type:"button",onClick:()=>Be(ye=>!ye),className:"w-full flex items-center justify-between gap-2 txt-soft hover:txt text-xs font-semibold py-1.5 transition"},React.createElement("span",{className:"flex items-center gap-1.5"},React.createElement(r,{name:"cpu",className:"w-3.5 h-3.5"}),_==="th"?"\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07":"Advanced options"),React.createElement(r,{name:pe?"close":"grid",className:"w-3.5 h-3.5"})),pe&&React.createElement("div",{className:"mt-2 space-y-3 animate-fadeup rounded-xl border hair p-3"},React.createElement("div",null,React.createElement("label",{className:"txt-dim text-xs"},_==="th"?"\u0E0A\u0E19\u0E34\u0E14\u0E20\u0E32\u0E1E":"Image type"),React.createElement("div",{className:"mt-1"},React.createElement(o,{options:_t,value:T,onChange:ye=>{C(ye),re(null)}}))),T!=="csv"&&React.createElement("div",null,React.createElement("label",{className:"txt-dim text-xs"},_==="th"?"\u0E41\u0E1B\u0E25\u0E07\u0E1B\u0E25\u0E39\u0E01 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)":"Field (optional)"),React.createElement("select",{value:Me,onChange:ye=>Pe(ye.target.value),className:"w-full mt-1 glass rounded-xl px-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"",className:"bg-ink-800"},"\u2014 ",_==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E23\u0E39\u0E1B\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19":"Photo analysis only"," \u2014"),ae.map(ye=>React.createElement("option",{key:ye.id,value:ye.id,className:"bg-ink-800"},_==="th"&&ye.name_th||ye.name))),React.createElement("p",{className:"txt-dim text-xs mt-1.5"},_==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E40\u0E2A\u0E23\u0E34\u0E21\u0E1C\u0E25\u0E14\u0E49\u0E27\u0E22\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21":"Select to add weather, terrain, and satellite context.")),T==="csv"&&React.createElement("div",null,React.createElement("label",{className:"txt-dim text-xs"},g("select_field")),React.createElement("select",{value:Me,onChange:ye=>Pe(ye.target.value),className:"w-full mt-1 glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"",className:"bg-ink-800"},"\u2014 ",g("all_fields")," \u2014"),ae.map(ye=>React.createElement("option",{key:ye.id,value:ye.id,className:"bg-ink-800"},_==="th"&&ye.name_th||ye.name)))))),React.createElement("button",{onClick:nt,disabled:H||!N,className:"analyze-action disabled:opacity-40"},H?React.createElement(React.Fragment,null,React.createElement(l,{className:"w-5 h-5"}),g("analyzing")):React.createElement(React.Fragment,null,React.createElement(r,{name:"brain",className:"w-5 h-5"}),g("analyze"))),T!=="csv"&&!N&&React.createElement("div",{className:"mt-4 grid sm:grid-cols-2 gap-2 text-sm"},React.createElement("div",{className:"rounded-xl border border-brand-500/25 bg-brand-500/10 p-3"},React.createElement("div",{className:"font-semibold text-brand-300 flex items-center gap-1"},React.createElement(r,{name:"check",className:"w-3.5 h-3.5"}),_==="th"?"\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30":"Good photo"),React.createElement("div",{className:"txt-soft mt-1 leading-relaxed"},_==="th"?"\u0E41\u0E2A\u0E07\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34 \u0E20\u0E32\u0E1E\u0E04\u0E21 \u0E43\u0E1A\u0E01\u0E34\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E27\u0E19\u0E43\u0E2B\u0E0D\u0E48 \u0E41\u0E25\u0E30\u0E16\u0E48\u0E32\u0E22\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21":"Natural light, sharp focus, leaf fills the frame, multiple angles.")),React.createElement("div",{className:"rounded-xl border border-rose-500/25 bg-rose-500/10 p-3"},React.createElement("div",{className:"font-semibold text-rose-300 flex items-center gap-1"},React.createElement(r,{name:"close",className:"w-3.5 h-3.5"}),_==="th"?"\u0E04\u0E27\u0E23\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48":"Retake"),React.createElement("div",{className:"txt-soft mt-1 leading-relaxed"},_==="th"?"\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E48\u0E19 \u0E22\u0E49\u0E2D\u0E19\u0E41\u0E2A\u0E07 \u0E43\u0E1A\u0E40\u0E25\u0E47\u0E01 \u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E23\u0E01 \u0E40\u0E1B\u0E35\u0E22\u0E01\u0E19\u0E49\u0E33 \u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E48\u0E32\u0E19\u0E1F\u0E34\u0E25\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2A\u0E35":"Blur, backlight, tiny leaf, clutter, wet leaf, or color filters."))))),(F||H)&&React.createElement("div",{className:"lg:col-span-3 space-y-4"},H&&React.createElement(m,null),!H&&!F&&React.createElement(n,{className:"min-h-[300px] grid place-items-center animate-fadeup"},React.createElement(c,{icon:"brain",text:_==="th"?"\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Upload a file to begin analysis"})),!H&&F&&(F.source==="csv"?React.createElement(y,{r:F,onRetake:Oe}):React.createElement(h,{r:F,preview:O,fieldId:Me,onRetake:Oe,onOpenAdvanced:tt})))),React.createElement(M,{open:ge,onClose:()=>De(!1),onCapture:ye=>{Qe(ye),De(!1)}}))}function M({open:g,onClose:_,onCapture:R}){let{t:v,lang:T,toast:C}=window.CG.Store.useStore(),N=t(null),L=t(null),[O,w]=i(!1),[D,P]=i(null),[V,Z]=i("environment"),H=()=>{L.current&&(L.current.getTracks().forEach(Ie=>Ie.stop()),L.current=null)},B=async Ie=>{H(),w(!1),P(null);try{let Me=await navigator.mediaDevices.getUserMedia({video:{facingMode:Ie,width:{ideal:1280},height:{ideal:720}},audio:!1});L.current=Me,N.current&&(N.current.srcObject=Me,await N.current.play(),w(!0))}catch{C(v("cam_error"),"error"),_()}};e(()=>(g?B(V):H(),H),[g]);let F=()=>{let Ie=N.current;if(!Ie)return;let Me=document.createElement("canvas");Me.width=Ie.videoWidth||640,Me.height=Ie.videoHeight||480,Me.getContext("2d").drawImage(Ie,0,0,Me.width,Me.height),P(Me.toDataURL("image/jpeg",.92))},re=()=>{if(!D)return;let Ie=atob(D.split(",")[1]),Me=new Uint8Array(Ie.length);for(let J=0;J<Ie.length;J++)Me[J]=Ie.charCodeAt(J);let Pe=new File([Me],`capture_${Date.now()}.jpg`,{type:"image/jpeg"});H(),R(Pe)},ae=()=>{let Ie=V==="environment"?"user":"environment";Z(Ie),B(Ie)};return React.createElement(p,{open:g,onClose:()=>{H(),_()},title:v("take_photo")},React.createElement("div",{className:"relative rounded-2xl overflow-hidden bg-black aspect-[4/3] grid place-items-center"},React.createElement("video",{ref:N,playsInline:!0,muted:!0,className:`w-full h-full object-cover ${D?"hidden":""}`,style:{transform:V==="user"?"scaleX(-1)":"none"}}),D&&React.createElement("img",{src:D,alt:"capture",className:"w-full h-full object-cover"}),!O&&!D&&React.createElement("div",{className:"absolute inset-0 grid place-items-center bg-black/40"},React.createElement("div",{className:"flex flex-col items-center gap-2 text-white/80"},React.createElement(l,{className:"w-6 h-6"}),React.createElement("span",{className:"text-sm"},v("cam_starting")))),O&&!D&&React.createElement("div",{className:"absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none"})),React.createElement("div",{className:"flex items-center justify-center gap-3 mt-4"},D?React.createElement(React.Fragment,null,React.createElement("button",{onClick:()=>B(V),className:"glass rounded-xl px-5 py-3 flex items-center gap-2 txt-soft hover:txt font-medium"},React.createElement(r,{name:"history",className:"w-4 h-4"}),v("retake")),React.createElement("button",{onClick:re,className:"grad-brand text-white font-semibold rounded-xl px-6 py-3 flex items-center gap-2 hover:brightness-110 transition shadow-lg shadow-brand-500/20"},React.createElement(r,{name:"check",className:"w-5 h-5"}),v("use_photo"))):React.createElement(React.Fragment,null,React.createElement("button",{onClick:ae,title:v("switch_cam"),className:"glass rounded-xl w-12 h-12 grid place-items-center txt-soft hover:txt"},React.createElement(r,{name:"history",className:"w-5 h-5"})),React.createElement("button",{onClick:F,disabled:!O,className:"grad-brand text-white font-semibold rounded-xl px-6 py-3 flex items-center gap-2 disabled:opacity-50 hover:brightness-110 transition shadow-lg shadow-brand-500/20"},React.createElement(r,{name:"camera",className:"w-5 h-5"}),v("capture")))))}function m(){let{Skeleton:g,Card:_}=window.CG.UI;return React.createElement(_,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center gap-3 mb-4"},React.createElement(l,{className:"w-5 h-5 text-brand-400"}),React.createElement("span",{className:"txt-soft text-sm"},"Running CassavaNet inference\u2026")),React.createElement("div",{className:"grid grid-cols-2 gap-4"},React.createElement(g,{className:"h-48"}),React.createElement("div",{className:"space-y-3"},React.createElement(g,{className:"h-6 w-3/4"}),React.createElement(g,{className:"h-4"}),React.createElement(g,{className:"h-4 w-2/3"}),React.createElement(g,{className:"h-20"}))))}function h({r:g,preview:_,fieldId:R,onRetake:v,onOpenAdvanced:T}){let{t:C,lang:N}=window.CG.Store.useStore(),L=g.top3[0],[O,w]=i("heat"),[D,P]=i(!1),V=g.auxiliary_findings?.find(F=>F.key==="whitefly"),[Z,H]=i(R?void 0:null),B=Z?.recommendations;return e(()=>{if(!R||!g.prediction_id){H(null);return}let F=!1;return H(void 0),window.CG.API_CLIENT.predictionContext(g.prediction_id).then(re=>{F||H(re)}).catch(re=>{F||H({evidence:[],recommendations:[],partial:!0,errors:[{source:"environment",error:re.message}]})}),()=>{F=!0}},[R,g.prediction_id]),React.createElement(React.Fragment,null,React.createElement(n,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center gap-2 mb-3 flex-wrap"},React.createElement(a,{tone:L.key,dot:!0},N==="th"?L.th:L.en),g.model_basis&&React.createElement(a,{tone:g.model_basis[L.key]==="trained_ml"?"low":"info"},g.model_basis[L.key]==="trained_ml"?N==="th"?"\u0E42\u0E21\u0E40\u0E14\u0E25\u0E17\u0E35\u0E48\u0E40\u0E17\u0E23\u0E19\u0E08\u0E23\u0E34\u0E07":"Trained model":N==="th"?"\u0E01\u0E0E\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07)":"Heuristic (no dataset yet)"),g.multi_view&&React.createElement(a,{tone:g.multi_view.agreement===1?"low":"medium"},N==="th"?`\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21 ${Math.round(g.multi_view.agreement*100)}% \u0E15\u0E23\u0E07\u0E01\u0E31\u0E19`:`Multi-view ${Math.round(g.multi_view.agreement*100)}% agreement`)),g.severity&&React.createElement("div",{className:"flex items-center gap-2 mb-3 flex-wrap"},React.createElement(a,{tone:g.severity.level==="severe"?"high":g.severity.level==="moderate"?"medium":"low"},N==="th"?{mild:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E40\u0E25\u0E47\u0E01\u0E19\u0E49\u0E2D\u0E22",moderate:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",severe:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E23\u0E38\u0E19\u0E41\u0E23\u0E07"}[g.severity.level]:{mild:"Mild",moderate:"Moderate",severe:"Severe"}[g.severity.level]),React.createElement("span",{className:"txt-dim text-[11px]"},N==="th"?g.severity.note_th:g.severity.note_en)),React.createElement("div",{className:"flex items-center gap-4"},React.createElement(f,{value:L.confidence*100,size:84,label:C("confidence")}),React.createElement("div",{className:"flex-1 min-w-0"},g.health_score&&React.createElement("div",{className:"mb-2 flex items-center gap-2"},React.createElement("div",{className:"text-2xl font-bold txt tabular-nums"},g.health_score.score,React.createElement("span",{className:"text-xs txt-dim font-normal"},"/100")),React.createElement("span",{className:"txt-dim text-[11px]"},N==="th"?g.health_score.note_th:g.health_score.note_en)),g.requires_review?React.createElement("div",{className:"rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-xs leading-relaxed"},N==="th"?`\u0E1C\u0E25\u0E19\u0E35\u0E49\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E17\u0E32\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E01\u0E31\u0E1A\u0E41\u0E1B\u0E25\u0E07 (${(g.review_reasons||[]).join(", ")})`:`Expert review is required before field action (${(g.review_reasons||[]).join(", ")})`):React.createElement("p",{className:"txt-soft text-xs leading-relaxed"},N==="th"?g.explanation_th:g.explanation_en))),React.createElement("div",{className:"mt-4 glass rounded-xl p-3"},React.createElement("div",{className:"txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"},React.createElement(r,{name:"bulb",className:"w-3.5 h-3.5 text-amber-400"}),N==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33":"Recommendation"),R?Z===void 0?React.createElement("div",{className:"flex items-center gap-2 txt-dim text-xs"},React.createElement(l,{className:"w-4 h-4"}),N==="th"?"\u0E1C\u0E25 AI \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E25\u0E49\u0E27 \xB7 \u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E2B\u0E25\u0E31\u0E07...":"AI result ready \xB7 loading weather, terrain and satellite evidence in the background..."):B&&B.length>0?React.createElement("ul",{className:"space-y-2"},B.slice(0,2).map((F,re)=>React.createElement("li",{key:re,className:"text-xs"},React.createElement("div",{className:"flex items-center justify-between gap-2"},React.createElement("span",{className:"txt font-semibold"},N==="th"?F.title_th:F.title_en),React.createElement(a,{tone:F.severity},Math.round(F.confidence*100),"%")),(N==="th"?F.actions_th:F.actions_en)?.[0]&&React.createElement("div",{className:"txt-soft mt-0.5 flex items-start gap-1.5"},React.createElement(r,{name:"check",className:"w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0"}),(N==="th"?F.actions_th:F.actions_en)[0])))):React.createElement("p",{className:"txt-dim text-xs"},N==="th"?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E41\u0E1B\u0E25\u0E07\u0E19\u0E35\u0E49\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49":"No recommendations for this field right now."):React.createElement("button",{onClick:T,className:"text-brand-300 hover:text-brand-200 text-xs font-medium flex items-center gap-1.5 transition"},N==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E31\u0E1A\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E08\u0E32\u0E30\u0E08\u0E07":"Attach a field for tailored recommendations"," ",React.createElement("span",{"aria-hidden":"true"},"\u2192"))),Z&&React.createElement("div",{className:"mt-3 rounded-xl border border-cyan-500/25 bg-cyan-500/[.07] p-3"},React.createElement("div",{className:"txt text-xs font-semibold flex items-center gap-1.5"},React.createElement(r,{name:"map",className:"w-4 h-4 text-cyan-300"}),N==="th"?"\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E08\u0E32\u0E01\u0E41\u0E1B\u0E25\u0E07":"Field evidence used"),React.createElement("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2"},Z.evidence.map(F=>{let re={weather:N==="th"?"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28":"Weather",terrain:N==="th"?"\u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28":"Terrain",satellite:N==="th"?"\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21":"Satellite"},ae=F.source==="weather"?`${F.summary?.rain_7d_mm??"\u2014"} mm/7d`:F.source==="terrain"?`${F.elevation_m??"\u2014"} m`:`NDVI ${F.summary?.ndvi??"\u2014"}`;return React.createElement("div",{key:F.source,className:"glass rounded-lg p-2"},React.createElement("div",{className:"txt-dim text-[10px]"},re[F.source]),React.createElement("div",{className:`text-xs font-semibold mt-0.5 ${F.available?"txt":"text-amber-300"}`},ae))})),React.createElement("p",{className:"txt-dim text-[10px] mt-2 leading-relaxed"},N==="th"?Z.disclaimer_th:Z.disclaimer_en)),React.createElement("button",{onClick:v,className:"w-full mt-4 glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium"},React.createElement(r,{name:"history",className:"w-4 h-4"}),N==="th"?"\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48":"Retake")),React.createElement(S,{result:g}),React.createElement("button",{onClick:()=>P(F=>!F),className:"w-full glass rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 txt-soft hover:txt text-xs font-semibold transition animate-fadeup"},React.createElement("span",{className:"flex items-center gap-1.5"},React.createElement(r,{name:"cpu",className:"w-3.5 h-3.5"}),N==="th"?"\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07":"Advanced Details"),React.createElement(r,{name:D?"close":"grid",className:"w-3.5 h-3.5"})),D&&React.createElement(React.Fragment,null,React.createElement(n,{className:"animate-fadeup"},React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},React.createElement("div",null,React.createElement("div",{className:"flex items-center gap-2 mb-2 flex-wrap"},React.createElement("span",{className:"txt-dim text-xs font-mono"},g.model.name," v",g.model.version)),React.createElement("div",{className:"relative rounded-xl overflow-hidden bg-black/20 grid place-items-center min-h-[220px]"},React.createElement("img",{src:O==="heat"?g.heatmap:_,alt:"analysis",className:"w-full object-contain max-h-[260px]"}),O==="whitefly"&&V?.image_size&&React.createElement("svg",{className:"absolute inset-0 w-full h-full pointer-events-none",viewBox:`0 0 ${V.image_size[0]} ${V.image_size[1]}`,preserveAspectRatio:"xMidYMid meet","aria-label":"Whitefly detection boxes"},V.detections.map((F,re)=>{let[ae,Ie,Me,Pe]=F.box_xyxy;return React.createElement("g",{key:re},React.createElement("rect",{x:ae,y:Ie,width:Me-ae,height:Pe-Ie,fill:"rgba(245,158,11,.12)",stroke:"#f59e0b",strokeWidth:Math.max(2,V.image_size[0]/700)}))})),React.createElement("div",{className:"absolute bottom-2 right-2 flex gap-1"},React.createElement("button",{onClick:()=>w("original"),className:`text-[11px] px-2 py-1 rounded-lg ${O==="original"?"grad-brand text-white":"glass-strong txt-soft"}`},"Original"),React.createElement("button",{onClick:()=>w("heat"),className:`text-[11px] px-2 py-1 rounded-lg ${O==="heat"?"grad-brand text-white":"glass-strong txt-soft"}`},N==="th"?"\u0E08\u0E38\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D":"Attribution"),V&&React.createElement("button",{onClick:()=>w("whitefly"),className:`text-[11px] px-2 py-1 rounded-lg ${O==="whitefly"?"bg-amber-500 text-white":"glass-strong txt-soft"}`},N==="th"?`\u0E01\u0E23\u0E2D\u0E1A\u0E41\u0E21\u0E25\u0E07 ${V.count}`:`Whitefly boxes ${V.count}`))),React.createElement("p",{className:"txt-dim text-[11px] mt-2 flex items-center gap-1.5"},React.createElement(r,{name:"brain",className:"w-3.5 h-3.5"}),C("attention")," \xB7 ",g.inference_ms," ms")),React.createElement("div",{className:"flex flex-col"},React.createElement("div",{className:"txt-soft text-xs"},C("top3")),g.top3.map((F,re)=>React.createElement("div",{key:F.key,className:"flex items-center gap-2 mt-1.5"},React.createElement("span",{className:`w-5 text-center text-[11px] font-bold ${re===0?"text-brand-400":"txt-dim"}`},"#",re+1),React.createElement("span",{className:"txt text-xs flex-1 truncate"},N==="th"?F.th:F.en),React.createElement("span",{className:"txt-soft text-xs font-mono tabular-nums"},(F.confidence*100).toFixed(1),"%"))),React.createElement("div",{className:"glass rounded-xl p-3 mt-3"},React.createElement("div",{className:"txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"},React.createElement(r,{name:"bulb",className:"w-3.5 h-3.5 text-amber-400"}),C("explain")),React.createElement("p",{className:"txt-soft text-xs leading-relaxed"},N==="th"?g.explanation_th:g.explanation_en))))),g.auxiliary_findings?.length>0&&React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"check",title:N==="th"?"\u0E1C\u0E25\u0E08\u0E32\u0E01\u0E2B\u0E31\u0E27\u0E42\u0E21\u0E40\u0E14\u0E25\u0E40\u0E2A\u0E23\u0E34\u0E21":"Auxiliary model findings",sub:N==="th"?"\u0E1C\u0E25\u0E2D\u0E34\u0E2A\u0E23\u0E30 \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E19\u0E33\u0E44\u0E1B\u0E23\u0E27\u0E21\u0E01\u0E31\u0E1A softmax 5 \u0E04\u0E25\u0E32\u0E2A":"Independent findings; not mixed into the five-class softmax"}),React.createElement("div",{className:"space-y-3"},g.auxiliary_findings.map(F=>React.createElement("div",{key:F.key,className:`rounded-xl border p-3 ${F.detected?"border-amber-500/35 bg-amber-500/10":"hair glass"}`},React.createElement("div",{className:"flex items-center justify-between gap-3 flex-wrap"},React.createElement("div",null,React.createElement("div",{className:"flex items-center gap-2"},React.createElement(a,{tone:F.detected?"medium":"slate",dot:F.detected},F.detected?N==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A\u0E40\u0E2B\u0E19\u0E37\u0E2D threshold":"detected above threshold":N==="th"?"\u0E44\u0E21\u0E48\u0E16\u0E36\u0E07 threshold":"below threshold"),React.createElement("span",{className:"txt text-sm font-semibold"},N==="th"?F.th:F.en)),React.createElement("div",{className:"txt-dim text-[10px] font-mono mt-1"},F.model.id,F.model.test_macro_f1!=null?` \xB7 test macro-F1 ${(F.model.test_macro_f1*100).toFixed(1)}%`:F.model.test_map50!=null?` \xB7 test mAP50 ${(F.model.test_map50*100).toFixed(1)}%`:"")),React.createElement("div",{className:"text-right"},React.createElement("div",{className:"txt text-xl font-bold tabular-nums"},F.count!=null?`${F.count} ${N==="th"?"\u0E15\u0E31\u0E27":"objects"}`:`${(F.probability*100).toFixed(1)}%`),React.createElement("div",{className:"txt-dim text-[10px]"},F.count!=null?`${N==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14":"max confidence"} ${(F.probability*100).toFixed(1)}%`:`threshold ${(F.threshold*100).toFixed(1)}%`))),React.createElement("div",{className:"h-2 rounded-full bg-white/5 overflow-hidden mt-3"},React.createElement("div",{className:`h-full rounded-full ${F.detected?"bg-amber-400":"bg-slate-400"}`,style:{width:`${F.probability*100}%`}})),React.createElement("div",{className:"txt-dim text-[11px] mt-2"},N==="th"?"\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E15\u0E23\u0E27\u0E08\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E41\u0E1B\u0E25\u0E07 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E2D\u0E34\u0E2A\u0E23\u0E30\u0E01\u0E31\u0E1A\u0E20\u0E32\u0E1E\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E17\u0E22":"Requires expert confirmation before field action and is not independently validated on Thai field photos."),F.model.evaluation_warning&&React.createElement("div",{className:"mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200"},N==="th"?"\u0E04\u0E33\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E: \u0E04\u0E48\u0E32 mAP/recall \u0E40\u0E14\u0E34\u0E21\u0E2D\u0E32\u0E08\u0E2A\u0E39\u0E07\u0E40\u0E01\u0E34\u0E19\u0E08\u0E23\u0E34\u0E07\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E41\u0E1A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1A\u0E1A\u0E40\u0E01\u0E48\u0E32 \u0E15\u0E49\u0E2D\u0E07\u0E1D\u0E36\u0E01\u0E43\u0E2B\u0E21\u0E48\u0E42\u0E14\u0E22\u0E41\u0E22\u0E01\u0E17\u0E31\u0E49\u0E07 acquisition run \u0E01\u0E48\u0E2D\u0E19\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21":"Quality warning: legacy splitting may overstate mAP/recall. Retraining with whole acquisition-run groups is required before field use."))))),React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"leaf",title:C("symptoms")}),React.createElement("div",{className:"space-y-2"},g.symptoms.map((F,re)=>React.createElement("div",{key:re,className:"flex items-center justify-between glass rounded-xl px-3 py-2"},React.createElement("span",{className:"txt text-sm"},N==="th"?F.th:F.en),React.createElement(a,{tone:F.severity==="info"?"info":F.severity},F.severity==="info"?"\u2014":Math.round(F.score*100)+"%"))))),React.createElement(n,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(s,{icon:"cpu",title:C("feat_imp")}),React.createElement("div",{className:"space-y-2.5"},g.feature_importance.map((F,re)=>React.createElement("div",{key:re},React.createElement("div",{className:"flex justify-between text-xs mb-1"},React.createElement("span",{className:"txt-soft"},F.feature),React.createElement("span",{className:"txt-dim font-mono"},(F.importance*100).toFixed(0),"%")),React.createElement("div",{className:"h-2 rounded-full bg-white/5 overflow-hidden"},React.createElement("div",{className:"h-full grad-brand rounded-full",style:{width:F.importance*100+"%",transition:"width 1s cubic-bezier(.2,.7,.2,1)"}}))))))),React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"grid",title:C("prob_dist"),sub:N==="th"?"\u0E2B\u0E31\u0E27\u0E42\u0E21\u0E40\u0E14\u0E25\u0E2B\u0E25\u0E31\u0E01 5 \u0E04\u0E25\u0E32\u0E2A\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19":"Primary five-class model head only"}),React.createElement(u,{items:Object.entries(g.probs).map(([F,re])=>{let ae=window.CG._classMap&&window.CG._classMap[F]||{th:F,en:F};return{key:F,label:N==="th"?ae.th:ae.en,value:re}}).sort((F,re)=>re.value-F.value)})),React.createElement("p",{className:"txt-dim text-[11px] text-center"},N==="th"?"CassavaGuard \u0E40\u0E1B\u0E47\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E32\u0E23\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E17\u0E35\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E42\u0E14\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23":"CassavaGuard is decision support, not a laboratory-confirmed diagnosis.")))}function S({result:g}){let{lang:_}=window.CG.Store.useStore(),[R,v]=i(10),[T,C]=i(220),[N,L]=i(1),[O,w]=i(null),[D,P]=i(!1),[V,Z]=i(""),[H,B]=i(!1),[F,re]=i(!1),[ae,Ie]=i(null),[Me,Pe]=i(""),[J,te]=i("1"),[ge,De]=i(""),[pe,Be]=i("KU50"),[ot,Ve]=i(""),[He,Qe]=i(""),[Oe,tt]=i([]),[nt,_t]=i(null),[Ke,ye]=i(""),[U,it]=i(null),[je,I]=i(null),[b,W]=i(!1),[X,Q]=i(!1),[oe,de]=i(null),[ee,ne]=i("side"),[le,Ae]=i(null),[fe,ue]=i(!1),[Ee,Le]=i(""),[Ue,z]=i(""),[j,q]=i("1"),[se,he]=i(null),[ie,be]=i(!1),[ce,qe]=i(""),ze=g.top3[0],lt=g.severity?.level||(ze.key==="healthy"?"mild":"moderate"),mt=Number(g.health_score?.score??Math.round((1-ze.confidence*.55)*100)),hi=ze.key==="healthy"?0:{mild:2,moderate:4,severe:7}[lt]||4,nn=_==="th"?ze.th:ze.en,fn=Math.max(.08,Math.min(1,(R-3)/9)),pn=mt>=80?"good":mt>=60?"fair":"poor";e(()=>{if(!g.prediction_id)return;let Se=!0,ut=setTimeout(async()=>{P(!0),Z("");try{let qt=await window.CG.API_CLIENT.yieldEstimate({prediction_id:g.prediction_id,age_months:R,height_cm:T,stem_count:N});Se&&w(qt)}catch(qt){Se&&Z(qt.message||"Yield estimate unavailable")}finally{Se&&P(!1)}},250);return()=>{Se=!1,clearTimeout(ut)}},[g.prediction_id,R,T,N]);let zt=O?.estimated_fresh_root_weight_kg_per_plant,Ft=O?.estimated_root_size,aa=Number(se?.estimated_fresh_root_weight_kg_per_plant?.midpoint||zt?.midpoint||2.5),mn=se?Math.cbrt(Number(Ue)/4e3):1,is=Math.max(.28,Math.min(1.6,aa/4.2)),ra=Number(Ft?.root_count||Math.round(4+fn*3)),oa=Number(Ft?.length_cm?.midpoint||28)*mn,ui=Number(Ft?.diameter_cm?.midpoint||5)*mn,la=async()=>{if(oe){ue(!0),Le(""),Ae(null);try{Ae(await window.CG.API_CLIENT.rootSize(oe,ee))}catch(Se){Le(Se.message||"Root analysis unavailable")}finally{ue(!1)}}},fi=async Se=>{Se.preventDefault(),be(!0),qe(""),he(null);try{he(await window.CG.API_CLIENT.rootWeight({volume_cm3_per_plant:Number(Ue),plant_count:Number(j)}))}catch(ut){qe(ut.message||"Root-weight analysis unavailable")}finally{be(!1)}},ss=async Se=>{let ut=await window.CG.API_CLIENT.startRootReconstruction({set_id:Se.set_id,reference_span_cm:Number(Ke)});for(it({...ut,extractedFrames:Se.view_count,videoQuality:Se.quality});!["complete","failed"].includes(ut.status);)await new Promise(qt=>setTimeout(qt,2e3)),ut=await window.CG.API_CLIENT.rootReconstructionStatus(ut.job_id),it(qt=>({...ut,extractedFrames:qt?.extractedFrames,videoQuality:qt?.videoQuality}));if(ut.status==="failed")throw new Error(ut.error);z(String(Math.round(ut.result.volume_cm3))),he(ut.result.weight)},ca=async()=>{qe(""),it({status:"uploading",progress:0});try{let Se=await window.CG.API_CLIENT.saveRootImageSet(Oe);await ss(Se)}catch(Se){qe(Se.message||"3-D reconstruction failed"),it(ut=>({...ut,status:"failed"}))}},fo=async()=>{qe(""),it({status:"extracting_video",progress:0});try{await ss(await window.CG.API_CLIENT.saveRootVideoSet(je))}catch(Se){qe(Se.message||"Video reconstruction failed"),it(ut=>({...ut,status:"failed"}))}},po=async Se=>{Se.preventDefault(),re(!0);try{let ut=Oe.length>=3?await window.CG.API_CLIENT.saveRootImageSet(Oe):{images:[]},qt=await window.CG.API_CLIENT.saveHarvestMeasurement({prediction_id:g.prediction_id,age_months:R,height_cm:T,stem_count:N,variety:pe,field_code:ot,season:He,latitude:nt?.latitude??null,longitude:nt?.longitude??null,root_volume_cm3_per_plant:Ue?Number(Ue):null,root_images:ut.images,total_fresh_root_weight_kg:Number(Me),harvested_plant_count:Number(J),notes:ge});Ie(qt)}catch(ut){Ie({error:ut.message||"Unable to save measurement"})}finally{re(!1)}};return React.createElement(n,{className:"animate-fadeup overflow-hidden cassava-model-card"},React.createElement("div",{className:"flex items-start justify-between gap-3 mb-3"},React.createElement("div",null,React.createElement("div",{className:"flex items-center gap-2"},React.createElement("span",{className:"model-live-dot"}),React.createElement("h3",{className:"txt text-base font-bold"},_==="th"?"\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Cassava plant model")),React.createElement("p",{className:"txt-dim text-xs mt-1"},_==="th"?"\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E08\u0E32\u0E01\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Generated automatically from the latest image result")),React.createElement(a,{tone:ze.key},nn)),React.createElement("div",{className:"grid sm:grid-cols-[minmax(250px,1fr)_minmax(190px,.75fr)] gap-4 items-center"},React.createElement("div",{className:"plant-stage",role:"img","aria-label":_==="th"?`\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E2A\u0E32\u0E21\u0E21\u0E34\u0E15\u0E34\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07 \u0E1C\u0E25 ${nn}`:`3D cassava plant simulation showing ${nn}`},React.createElement(E,{disease:ze.key,affectedCount:hi,severity:lt,maturity:fn,health:mt,stemCount:N,rootAbundance:is,rootCount:ra,rootLength:oa,rootDiameter:ui}),React.createElement("div",{className:"plant-3d-badge"},"3D LIVE \u2022 ",_==="th"?"\u0E25\u0E32\u0E01\u0E2B\u0E21\u0E38\u0E19 \u2022 \u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E0B\u0E39\u0E21":"drag to rotate \u2022 scroll to zoom"),React.createElement("div",{className:"plant-stage-legend"},React.createElement("span",null,React.createElement("i",{className:"legend-leaf"}),_==="th"?"\u0E17\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E21":"Canopy"),React.createElement("span",null,React.createElement("i",{className:"legend-root"}),_==="th"?"\u0E2B\u0E31\u0E27\u0E43\u0E15\u0E49\u0E14\u0E34\u0E19\u0E08\u0E33\u0E25\u0E2D\u0E07":"Simulated roots")),React.createElement("div",{className:"plant-stage-caption"},_==="th"?"\u0E20\u0E32\u0E1E\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E2A\u0E16\u0E32\u0E19\u0E01\u0E32\u0E23\u0E13\u0E4C \u2022 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E32\u0E23\u0E2A\u0E41\u0E01\u0E19\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E08\u0E23\u0E34\u0E07":"Scenario visualization \u2022 not an actual structural scan")),React.createElement("div",{className:"space-y-3"},React.createElement("div",{className:"model-stat"},React.createElement("span",{className:"txt-soft"},_==="th"?"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13":"Estimated health"),React.createElement("strong",{className:"txt"},mt,"/100"),React.createElement("div",{className:"model-meter"},React.createElement("span",{style:{width:`${Math.max(0,Math.min(100,mt))}%`}}))),React.createElement("div",{className:"model-stat model-weight"},React.createElement("span",{className:"txt-soft"},_==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2B\u0E31\u0E27\u0E2A\u0E14\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13/\u0E15\u0E49\u0E19":"Estimated fresh root weight"),React.createElement("strong",{className:"txt"},D&&!zt?React.createElement(l,{className:"w-4 h-4"}):zt?`\u2248 ${zt.midpoint.toFixed(2)} kg`:"\u2014"),zt&&React.createElement("div",{className:"weight-range col-span-2"},React.createElement("span",{style:{left:`${Math.max(4,Math.min(88,zt.midpoint/zt.high*100))}%`}}),React.createElement("small",null,zt.low.toFixed(2),"\u2013",zt.high.toFixed(2)," kg"))),React.createElement("div",{className:"root-size-grid"},React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E2B\u0E31\u0E27":"Root count"),React.createElement("b",null,Ft?`\u2248 ${Ft.root_count}`:"\u2014")),React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22":"Mean length"),React.createElement("b",null,Ft?`\u2248 ${Ft.length_cm.midpoint.toFixed(1)} cm`:"\u2014")),React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E40\u0E2A\u0E49\u0E19\u0E1C\u0E48\u0E32\u0E19\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E01\u0E25\u0E32\u0E07":"Diameter"),React.createElement("b",null,Ft?`\u2248 ${Ft.diameter_cm.midpoint.toFixed(1)} cm`:"\u2014")),React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14":"Size class"),React.createElement("b",null,Ft?_==="th"?{small:"\u0E40\u0E25\u0E47\u0E01",medium:"\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",large:"\u0E43\u0E2B\u0E0D\u0E48"}[Ft.size_class]:Ft.size_class:"\u2014"))),React.createElement("div",{className:"model-stat"},React.createElement("span",{className:"txt-soft"},_==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E02\u0E2D\u0E07\u0E15\u0E49\u0E19":"Plant condition"),React.createElement("strong",{className:pn==="good"?"text-emerald-500":pn==="fair"?"text-amber-500":"text-rose-500"},_==="th"?{good:"\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E14\u0E35",fair:"\u0E04\u0E27\u0E23\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07",poor:"\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07"}[pn]:{good:"Good",fair:"Monitor",poor:"At risk"}[pn])),React.createElement("div",{className:"model-stat"},React.createElement("span",{className:"txt-soft"},_==="th"?"\u0E43\u0E1A\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E43\u0E19\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07":"Affected leaves in model"),React.createElement("strong",{className:"txt"},hi,"/8")))),React.createElement("button",{type:"button",className:"add-evidence-button mt-4",onClick:()=>Q(Se=>!Se)},React.createElement(r,{name:"cpu",className:"w-4 h-4"}),_==="th"?"\u0E1B\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)":"Refine optional inputs"),X&&React.createElement("div",{className:"model-inputs mt-3"},React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E2D\u0E32\u0E22\u0E38\u0E1E\u0E37\u0E0A":"Plant age"," ",React.createElement("b",null,R," ",_==="th"?"\u0E40\u0E14\u0E37\u0E2D\u0E19":"months")),React.createElement("input",{type:"range",min:"3",max:"18",value:R,onChange:Se=>v(Number(Se.target.value))})),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13":"Approx. height"," ",React.createElement("b",null,T," cm")),React.createElement("input",{type:"range",min:"50",max:"400",step:"10",value:T,onChange:Se=>C(Number(Se.target.value))})),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E25\u0E33\u0E15\u0E49\u0E19":"Stem count"," ",React.createElement("b",null,N)),React.createElement("input",{type:"range",min:"1",max:"6",value:N,onChange:Se=>L(Number(Se.target.value))}))),React.createElement("div",{className:"rounded-xl bg-brand-500/10 border border-brand-500/20 p-3 mt-4"},React.createElement("strong",{className:"txt text-sm"},_==="th"?"\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E02\u0E38\u0E14":"Non-destructive yield estimate"),React.createElement("p",{className:"txt-soft text-xs mt-1"},_==="th"?"\u0E04\u0E33\u0E19\u0E27\u0E13\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19 \u0E2D\u0E32\u0E22\u0E38 \u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07 \u0E08\u0E33\u0E19\u0E27\u0E19\u0E25\u0E33\u0E15\u0E49\u0E19 \u0E1C\u0E25\u0E42\u0E23\u0E04 \u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07 \u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E13\u0E4C \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E17\u0E35\u0E48\u0E27\u0E31\u0E14\u0E42\u0E14\u0E22\u0E15\u0E23\u0E07":"Uses the whole-plant image, age, height, stems, disease and field context. This is a prediction interval, not a direct weight measurement.")),React.createElement("button",{type:"button",className:"add-evidence-button mt-3",onClick:()=>W(Se=>!Se)},React.createElement(r,{name:"check",className:"w-4 h-4"}),_==="th"?"\u0E42\u0E2B\u0E21\u0E14\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E14\u0E49\u0E27\u0E22\u0E01\u0E32\u0E23\u0E02\u0E38\u0E14\u0E41\u0E25\u0E30 3D (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)":"Optional harvest/3-D validation mode"),b&&React.createElement(React.Fragment,null,React.createElement("div",{className:"root-ml-panel mt-4"},React.createElement("div",null,React.createElement("strong",{className:"txt"},_==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E02\u0E19\u0E32\u0E14\u0E23\u0E32\u0E01\u0E14\u0E49\u0E27\u0E22 ML \u0E08\u0E23\u0E34\u0E07":"Real ML root-size analysis"),React.createElement("p",{className:"txt-dim text-xs mt-1"},_==="th"?"\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E2B\u0E31\u0E27\u0E17\u0E35\u0E48\u0E02\u0E38\u0E14\u0E41\u0E25\u0E49\u0E27\u0E1A\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E2A\u0E35\u0E14\u0E33 \u0E21\u0E35\u0E27\u0E07\u0E01\u0E25\u0E21\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07 2 \u0E19\u0E34\u0E49\u0E27":"Use an excavated-root photo on black cloth with a 2-inch reference disk.")),React.createElement("div",{className:"grid sm:grid-cols-[1fr_auto_auto] gap-2 mt-3"},React.createElement("input",{type:"file",accept:"image/*",onChange:Se=>{de(Se.target.files[0]||null),Ae(null)}}),React.createElement("select",{value:ee,onChange:Se=>ne(Se.target.value)},React.createElement("option",{value:"side"},_==="th"?"\u0E21\u0E38\u0E21\u0E14\u0E49\u0E32\u0E19\u0E02\u0E49\u0E32\u0E07":"Side view"),React.createElement("option",{value:"top"},_==="th"?"\u0E21\u0E38\u0E21\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19":"Top view")),React.createElement("button",{type:"button",className:"primary-action px-4",disabled:!oe||fe,onClick:la},fe?React.createElement(l,{className:"w-4 h-4"}):React.createElement(r,{name:"brain",className:"w-4 h-4"}),_==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E23\u0E32\u0E01":"Analyze roots")),Ee&&React.createElement("p",{className:"text-rose-500 text-xs mt-2"},Ee),le&&React.createElement("div",{className:"root-ml-results mt-3"},Object.entries(le.measurements).map(([Se,ut])=>React.createElement("div",{key:Se},React.createElement("span",null,Se),React.createElement("b",null,Number(ut).toLocaleString()))),React.createElement("p",null,_==="th"?`\u0E42\u0E21\u0E40\u0E14\u0E25 ${le.model_id} \u2022 \u0E1D\u0E36\u0E01 ${le.training_samples} \u0E20\u0E32\u0E1E \u2022 \u0E1C\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E48\u0E27\u0E22 DIRT`:`${le.model_id} \u2022 ${le.training_samples} training images \u2022 DIRT units`))),React.createElement("form",{className:"root-ml-panel mt-4",onSubmit:fi},React.createElement("div",null,React.createElement("strong",{className:"txt"},_==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E14\u0E49\u0E27\u0E22 ML":"ML fresh-root weight analysis"),React.createElement("p",{className:"txt-dim text-xs mt-1"},_==="th"?"\u0E01\u0E23\u0E2D\u0E01\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E23\u0E32\u0E01\u0E2A\u0E14\u0E15\u0E48\u0E2D\u0E15\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E02\u0E38\u0E14 \u0E27\u0E31\u0E14\u0E14\u0E49\u0E27\u0E22\u0E16\u0E31\u0E07\u0E25\u0E49\u0E19/\u0E01\u0E32\u0E23\u0E41\u0E17\u0E19\u0E17\u0E35\u0E48\u0E19\u0E49\u0E33 \u0E2B\u0E23\u0E37\u0E2D\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07 3D \u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21":"Enter excavated fresh-root volume per plant measured by water displacement or multi-view 3-D reconstruction.")),React.createElement("div",{className:"grid sm:grid-cols-[1fr_1fr_auto] gap-2 mt-3"},React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E23\u0E32\u0E01/\u0E15\u0E49\u0E19 (\u0E0B\u0E21.\xB3)":"Root volume/plant (cm\xB3)"),React.createElement("input",{type:"number",min:"200",max:"20000",step:"1",required:!0,placeholder:"\u0E40\u0E0A\u0E48\u0E19 4000",value:Ue,onChange:Se=>z(Se.target.value)})),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19":"Plant count"),React.createElement("input",{type:"number",min:"1",max:"1000",step:"1",required:!0,value:j,onChange:Se=>q(Se.target.value)})),React.createElement("button",{type:"submit",className:"primary-action px-4 self-end",disabled:ie||!Ue},ie?React.createElement(l,{className:"w-4 h-4"}):React.createElement(r,{name:"brain",className:"w-4 h-4"}),_==="th"?"\u0E04\u0E33\u0E19\u0E27\u0E13\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01":"Estimate weight")),React.createElement("div",{className:"mt-4 pt-4 border-t border-white/10"},React.createElement("strong",{className:"txt text-sm"},_==="th"?"\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23 3D \u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21":"Automatic multi-view 3-D volume"),React.createElement("div",{className:"rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mt-2"},React.createElement("b",{className:"txt text-sm"},_==="th"?"\u0E41\u0E19\u0E30\u0E19\u0E33: \u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E40\u0E14\u0E34\u0E19\u0E23\u0E2D\u0E1A\u0E2B\u0E31\u0E27\u0E21\u0E31\u0E19":"Recommended: upload an orbit video"),React.createElement("div",{className:"grid sm:grid-cols-[1fr_180px_auto] gap-2 mt-2"},React.createElement("input",{type:"file",accept:"video/mp4,video/quicktime,video/webm,.m4v",onChange:Se=>I(Se.target.files?.[0]||null)}),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E01\u0E27\u0E49\u0E32\u0E07\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 (\u0E0B\u0E21.)":"Measured max span (cm)"),React.createElement("input",{type:"number",min:"5",max:"300",step:"0.1",value:Ke,onChange:Se=>ye(Se.target.value)})),React.createElement("button",{type:"button",className:"primary-action px-4 self-end",disabled:!je||!Ke||U&&!["complete","failed"].includes(U.status),onClick:fo},React.createElement(r,{name:"play",className:"w-4 h-4"}),_==="th"?"\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D \u2192 3D":"Video \u2192 3-D")),React.createElement("p",{className:"txt-dim text-xs mt-2"},_==="th"?"\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A MP4/MOV/WebM \u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 250 MB \u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27 4\u201390 \u0E27\u0E34\u0E19\u0E32\u0E17\u0E35 \u0E23\u0E30\u0E1A\u0E1A\u0E04\u0E31\u0E14\u0E40\u0E1F\u0E23\u0E21\u0E04\u0E21\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E0B\u0E49\u0E33\u0E43\u0E2B\u0E49\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34":"MP4/MOV/WebM up to 250 MB, 4\u201390 seconds. Sharp, non-duplicate frames are selected automatically.")),React.createElement("p",{className:"txt-dim text-xs mt-3"},_==="th"?"\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21\u0E40\u0E2D\u0E07":"Or select multiple photos manually"),React.createElement("div",{className:"grid sm:grid-cols-[1fr_180px_auto] gap-2 mt-2"},React.createElement("input",{type:"file",accept:"image/*",multiple:!0,onChange:Se=>tt(Array.from(Se.target.files||[]))}),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E01\u0E27\u0E49\u0E32\u0E07\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 (\u0E0B\u0E21.)":"Measured max span (cm)"),React.createElement("input",{type:"number",min:"5",max:"300",step:"0.1",value:Ke,onChange:Se=>ye(Se.target.value)})),React.createElement("button",{type:"button",className:"primary-action px-4 self-end",disabled:Oe.length<12||!Ke||U&&!["complete","failed"].includes(U.status),onClick:ca},React.createElement(r,{name:"cube",className:"w-4 h-4"}),_==="th"?"\u0E2A\u0E23\u0E49\u0E32\u0E07 3D":"Build 3-D")),React.createElement("p",{className:"txt-dim text-xs mt-2"},_==="th"?`\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 12 \u0E20\u0E32\u0E1E (\u0E41\u0E19\u0E30\u0E19\u0E33 20\u201330) \u0E40\u0E14\u0E34\u0E19\u0E16\u0E48\u0E32\u0E22\u0E23\u0E2D\u0E1A\u0E2B\u0E31\u0E27\u0E43\u0E2B\u0E49\u0E20\u0E32\u0E1E\u0E0B\u0E49\u0E2D\u0E19\u0E01\u0E31\u0E19 70\u201380% \u2022 \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 ${Oe.length} \u0E20\u0E32\u0E1E`:`Use at least 12 views (20\u201330 recommended) with 70\u201380% overlap \u2022 ${Oe.length} selected`),U&&React.createElement("div",{className:"model-meter mt-2"},React.createElement("span",{style:{width:`${U.progress||0}%`}})),U&&React.createElement("p",{className:"text-xs txt-soft mt-1"},U.status," ",U.stage?`\u2022 ${U.stage}`:""," \u2022 ",U.progress||0,"%"),U?.extractedFrames&&React.createElement("p",{className:"text-xs text-emerald-500 mt-1"},_==="th"?`\u0E04\u0E31\u0E14\u0E08\u0E32\u0E01\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E41\u0E25\u0E49\u0E27 ${U.extractedFrames} \u0E40\u0E1F\u0E23\u0E21`:`${U.extractedFrames} video frames selected`)),ce&&React.createElement("p",{className:"text-rose-500 text-xs mt-2"},ce),se&&React.createElement("div",{className:"root-ml-results mt-3"},React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2A\u0E14/\u0E15\u0E49\u0E19":"Fresh weight/plant"),React.createElement("b",null,se.estimated_fresh_root_weight_kg_per_plant.midpoint.toFixed(2)," kg")),React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E0A\u0E48\u0E27\u0E07\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C 95%":"95% prediction range"),React.createElement("b",null,se.estimated_fresh_root_weight_kg_per_plant.low.toFixed(2),"\u2013",se.estimated_fresh_root_weight_kg_per_plant.high.toFixed(2)," kg")),React.createElement("div",null,React.createElement("span",null,_==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E23\u0E27\u0E21":"Total weight"),React.createElement("b",null,se.estimated_total_weight_kg.midpoint.toFixed(2)," kg")),React.createElement("p",null,_==="th"?`\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E0A\u0E31\u0E48\u0E07\u0E08\u0E23\u0E34\u0E07 ${se.model.samples} \u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 / ${se.model.cultivars} \u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C \u2022 \u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E41\u0E1A\u0E1A\u0E40\u0E27\u0E49\u0E19\u0E17\u0E35\u0E25\u0E30\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C: R\xB2 ${se.model.r2.toFixed(3)}, MAE ${se.model.mae_kg.toFixed(2)} \u0E01\u0E01. \u2022 ${se.in_training_domain?"\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1D\u0E36\u0E01":"\u0E2D\u0E22\u0E39\u0E48\u0E19\u0E2D\u0E01\u0E0A\u0E48\u0E27\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1D\u0E36\u0E01\u2014\u0E0A\u0E48\u0E27\u0E07\u0E16\u0E39\u0E01\u0E02\u0E22\u0E32\u0E22"}`:`${se.model.samples} weighed samples / ${se.model.cultivars} cultivars \u2022 leave-one-cultivar-out R\xB2 ${se.model.r2.toFixed(3)}, MAE ${se.model.mae_kg.toFixed(2)} kg \u2022 ${se.in_training_domain?"within training range":"outside training range\u2014interval widened"}`)),React.createElement("p",{className:"text-xs txt-soft mt-3"},_==="th"?"\u0E2A\u0E33\u0E04\u0E31\u0E0D: \u0E20\u0E32\u0E1E\u0E43\u0E1A\u0E43\u0E0A\u0E49\u0E1A\u0E2D\u0E01\u0E42\u0E23\u0E04 \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E2B\u0E31\u0E27\u0E43\u0E15\u0E49\u0E14\u0E34\u0E19 \u0E08\u0E36\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E27\u0E31\u0E14\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E23\u0E32\u0E01\u0E2B\u0E25\u0E31\u0E07\u0E02\u0E38\u0E14 \u0E23\u0E30\u0E1A\u0E1A\u0E19\u0E35\u0E49\u0E22\u0E31\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E07\u0E32\u0E19\u0E17\u0E14\u0E25\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49\u0E41\u0E17\u0E19\u0E01\u0E32\u0E23\u0E0A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D\u0E02\u0E32\u0E22":"Important: a leaf photo cannot reveal underground roots. Measure excavated-root volume. This experimental model does not replace trade weighing."))),React.createElement("p",{className:"mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs txt-soft leading-relaxed"},V||(O?_==="th"?`${O.disclaimer_th} \u0E08\u0E33\u0E19\u0E27\u0E19\u0E41\u0E25\u0E30\u0E02\u0E19\u0E32\u0E14\u0E2B\u0E31\u0E27\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E2D\u0E32\u0E22\u0E38 \u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07 \u0E08\u0E33\u0E19\u0E27\u0E19\u0E25\u0E33\u0E15\u0E49\u0E19 \u0E41\u0E25\u0E30\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E42\u0E23\u0E04`:`${O.disclaimer_en} Root count and dimensions are scenarios based on age, height, stem count and disease result.`:_==="th"?"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E04\u0E33\u0E19\u0E27\u0E13\u0E0A\u0E48\u0E27\u0E07\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E01\u0E23\u0E2D\u0E01":"Calculating a range from the supplied observations")),React.createElement("button",{type:"button",onClick:()=>B(Se=>!Se),className:"add-evidence-button mt-3","aria-expanded":H},React.createElement(r,{name:"check",className:"w-4 h-4"}),_==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E17\u0E35\u0E48\u0E02\u0E38\u0E14\u0E0A\u0E31\u0E48\u0E07\u0E08\u0E23\u0E34\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E42\u0E21\u0E40\u0E14\u0E25":"Record an actual harvest weight to improve the model"),H&&React.createElement("form",{onSubmit:po,className:"harvest-form mt-3"},React.createElement("div",{className:"grid sm:grid-cols-2 gap-3"},React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2B\u0E31\u0E27\u0E2A\u0E14\u0E23\u0E27\u0E21 (\u0E01\u0E01.)":"Total fresh-root weight (kg)"),React.createElement("input",{type:"number",min:"0.02",max:"2000",step:"0.01",required:!0,value:Me,onChange:Se=>Pe(Se.target.value)})),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E38\u0E14\u0E0A\u0E31\u0E48\u0E07":"Number of harvested plants"),React.createElement("input",{type:"number",min:"1",max:"1000",step:"1",required:!0,value:J,onChange:Se=>te(Se.target.value)}))),React.createElement("div",{className:"grid sm:grid-cols-3 gap-3 mt-3"},React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Variety"),React.createElement("input",{required:!0,value:pe,onChange:Se=>Be(Se.target.value)})),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07":"Field code"),React.createElement("input",{required:!0,value:ot,onChange:Se=>Ve(Se.target.value),placeholder:"FIELD-001"})),React.createElement("label",null,React.createElement("span",null,_==="th"?"\u0E24\u0E14\u0E39/\u0E23\u0E2D\u0E1A\u0E1B\u0E25\u0E39\u0E01":"Season"),React.createElement("input",{required:!0,value:He,onChange:Se=>Qe(Se.target.value),placeholder:"2026-rainy"}))),React.createElement("label",{className:"mt-3"},React.createElement("span",null,_==="th"?"\u0E20\u0E32\u0E1E\u0E23\u0E32\u0E01\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21 (\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 3; \u0E41\u0E19\u0E30\u0E19\u0E33 20\u201330 \u0E20\u0E32\u0E1E)":"Multi-view root photos (minimum 3; recommended 20\u201330)"),React.createElement("input",{type:"file",accept:"image/*",multiple:!0,required:!0,onChange:Se=>tt(Array.from(Se.target.files||[]))})),React.createElement("button",{type:"button",className:"add-evidence-button mt-3",onClick:()=>navigator.geolocation?.getCurrentPosition(Se=>_t({latitude:Se.coords.latitude,longitude:Se.coords.longitude}))},React.createElement(r,{name:"map",className:"w-4 h-4"}),nt?`${nt.latitude.toFixed(5)}, ${nt.longitude.toFixed(5)}`:_==="th"?"\u0E41\u0E19\u0E1A\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E41\u0E1B\u0E25\u0E07 (\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E43\u0E08)":"Attach field coordinates (optional)"),React.createElement("label",{className:"mt-3"},React.createElement("span",null,_==="th"?"\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E40\u0E01\u0E47\u0E1A\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 (\u0E16\u0E49\u0E32\u0E21\u0E35)":"Sampling notes (optional)"),React.createElement("textarea",{rows:"2",maxLength:"1000",value:ge,onChange:Se=>De(Se.target.value)})),ae&&React.createElement("p",{className:`text-sm mt-3 ${ae.error?"text-rose-400":"text-emerald-500"}`},ae.error||(_==="th"?`\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E49\u0E27: ${ae.weight_kg_per_plant} \u0E01\u0E01./\u0E15\u0E49\u0E19`:`Saved: ${ae.weight_kg_per_plant} kg/plant`)),React.createElement("button",{className:"primary-action w-full mt-3",disabled:F||!!(ae&&!ae.error)},F?React.createElement(l,{className:"w-4 h-4"}):React.createElement(r,{name:"check",className:"w-4 h-4"}),_==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E27\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07":"Save measured value")))}function E({disease:g,affectedCount:_,severity:R,maturity:v,health:T,stemCount:C,rootAbundance:N,rootCount:L,rootLength:O,rootDiameter:w}){let D=t(null);return e(()=>{let P=D.current;if(!P)return;let V;try{V=new co({canvas:P,antialias:!0,alpha:!0,powerPreference:"high-performance"})}catch{P.dataset.webglUnavailable="true";return}V.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),V.outputColorSpace=Bt,V.toneMapping=Ys,V.toneMappingExposure=1.12,V.shadowMap.enabled=!0,V.shadowMap.type=gr;let Z=new ys,H=new At(36,1,.1,100);H.position.set(.15,2.45,7.6),H.lookAt(0,1.05,0),Z.fog=new _s(465698,.045),Z.add(new Gs(14350591,4926742,2.35));let B=new Yi(16777215,3.2);B.position.set(4,7,5),B.castShadow=!0,B.shadow.mapSize.set(1024,1024),B.shadow.camera.near=.5,B.shadow.camera.far=18,Z.add(B);let F=new Yi(2282478,1.1);F.position.set(-4,3,-4),Z.add(F);let re=new Ws(16758891,1.2,10);re.position.set(2.5,.2,3.5),Z.add(re);let ae=new _n;Z.add(ae);let Ie=[],Me=[],Pe=j=>{let q=new ks(j);return Ie.push(q),q},J=(j,q)=>{Me.push(j);let se=new Wt(j,q);return se.castShadow=!0,se.receiveShadow=!0,se},te=Pe({color:2598987,roughness:.68,side:Dt}),ge=Pe({color:6016871,roughness:.7,side:Dt}),pe=Pe({color:{cbb:8142098,cbsd:15381256,cmd:16436245,cgm:10118160}[g]||10576391,roughness:.8,side:Dt}),Be=Pe({color:4160826,roughness:.96}),ot=Pe({color:7181389,roughness:1}),Ve=Pe({color:11818325,roughness:.86}),He=Pe({color:13207372,roughness:.92,metalness:.01}),Qe=Pe({color:14722667,roughness:.9}),Oe=Pe({color:8474669,roughness:1}),tt=Pe({color:5846303,roughness:1,transparent:!0,opacity:.52}),nt=[],_t=J(new ki(2.15,2,.58,64,1,!0,0,Math.PI*1.72),tt);_t.position.y=-.72,_t.receiveShadow=!0,ae.add(_t);let Ke=J(new ai(2.14,64,.2,Math.PI*1.68),Pe({color:7423270,roughness:1,side:Dt}));Ke.rotation.x=-Math.PI/2,Ke.position.y=-.43,ae.add(Ke);let ye=J(new ai(2.35,64),Pe({color:133902,transparent:!0,opacity:.34,roughness:1}));ye.rotation.x=-Math.PI/2,ye.position.y=-1.83,ye.receiveShadow=!0,ae.add(ye);let U=2.55+v*.45,it=(j,q,se,he,ie=8)=>{let be=new k().subVectors(q,j),ce=J(new ki(se*.78,se,be.length(),ie),he);return ce.position.copy(j).add(q).multiplyScalar(.5),ce.quaternion.setFromUnitVectors(new k(0,1,0),be.clone().normalize()),ce},je=Math.max(1,Math.min(4,Math.round(C||1)));for(let j=0;j<je;j+=1){let q=j/je*Math.PI*2+.35,se=new k(Math.cos(q)*j*.045,-.48,Math.sin(q)*j*.045),he=new k(Math.cos(q)*j*.16,U-.48-j*.08,Math.sin(q)*j*.16);ae.add(it(se,he,.075-j*.006,Be,14));for(let ie=0;ie<8;ie+=1){let be=(ie+1)/10,ce=J(new Wi(.077-j*.006,.009,5,18),ot);ce.position.lerpVectors(se,he,be),ce.rotation.x=Math.PI/2,ae.add(ce)}}let I=Math.max(3,Math.min(12,Math.round(L||6))),b=Math.max(.62,Math.min(1.45,Number(O||28)/28)),W=Math.max(.62,Math.min(1.55,Number(w||5)/5));for(let j=0;j<I;j+=1){let q=j/I*Math.PI*2+.28,se=.8+j%4*.075,he=[new me(.018,0),new me(.08*W,.08),new me(.18*W*se*N,.26),new me(.2*W*se*N,.56),new me(.15*W*se*N,.82),new me(.055*W,1.05),new me(.008,1.18)],ie=J(new Us(he,28),j%3===0?Qe:He);ie.scale.y=b*se,ie.position.set(Math.cos(q)*.3,-.48,Math.sin(q)*.3),ie.rotation.z=Math.cos(q)*(.3+j%2*.1),ie.rotation.x=Math.sin(q)*(.3+j%2*.1),ie.rotation.y=-q,ae.add(ie);for(let ze=1;ze<=3;ze+=1){let lt=J(new Wi(.12*W*se*N,.006,5,24),Oe);lt.position.set(Math.cos(q)*(.3+ze*.035),-.48-ze*.22*b*se,Math.sin(q)*(.3+ze*.035)),lt.rotation.x=Math.PI/2,lt.rotation.z=Math.cos(q)*.32,ae.add(lt)}let be=new k(Math.cos(q)*.68,-1.34*b*se,Math.sin(q)*.68),ce=new k(Math.cos(q+.18)*.92,be.y-.26,Math.sin(q+.18)*.92);ae.add(it(be,ce,.014,Oe,6));let qe=new Gi([ce,new k(Math.cos(q+.28)*1.05,ce.y-.16,Math.sin(q+.28)*1.05),new k(Math.cos(q+.42)*1.18,ce.y-.34,Math.sin(q+.42)*1.18)]);ae.add(J(new Bs(qe,10,.008,5,!1),Oe))}let X=new Vi;X.moveTo(0,0),X.bezierCurveTo(.09,.08,.19,.3,.13,.62),X.bezierCurveTo(.07,.88,0,1.04,0,1.1),X.bezierCurveTo(0,1.04,-.07,.88,-.13,.62),X.bezierCurveTo(-.19,.3,-.09,.08,0,0);let Q=14;for(let j=0;j<Q;j+=1){let q=j*2.399963,se=.62+j%5*.43,he=.72+j%3*.13,ie=new k(0,se,0),be=new k(Math.cos(q)*he,se+.18,Math.sin(q)*he);ae.add(it(ie,be,.022,Ve));let ce=new _n;ce.position.copy(be),ce.rotation.set(-1.08+j%3*.05,0,-q-Math.PI/2),ce.userData.baseX=ce.rotation.x,ce.userData.phase=j*.73,nt.push(ce);let qe=j<Math.round(_*1.5),ze=R==="severe"&&qe?.76:1;for(let lt=0;lt<7;lt+=1){let mt=(lt-3)*.39,hi=qe?pe:j>10?ge:te,nn=J(new Os(X,8),hi),fn=(lt===3?.68:.52-Math.abs(lt-3)*.025)*ze;nn.scale.set(fn,fn,1),nn.rotation.x=(lt%2?-.08:.06)+(100-T)*.0015,nn.rotation.z=-mt,nn.position.set(Math.sin(mt)*.075,Math.cos(mt)*.075,(lt-3)*.004),ce.add(nn);let pn=new k(-Math.sin(mt)*fn*.04,Math.cos(mt)*fn*.88,.006);if(ce.add(it(new k(0,0,.006),pn,.006,Be,5)),qe&&lt%2===0){let zt=J(new ai(.035,10),Pe({color:8138002,side:Dt,roughness:1}));zt.position.set(Math.sin(mt)*.08,.23+Math.cos(mt)*.05,.012),ce.add(zt)}}ae.add(ce)}ae.position.y=.05,ae.rotation.x=-.06;let oe,de=!1,ee=0,ne=0,le=()=>{let j=P.getBoundingClientRect();V.setSize(Math.max(1,j.width),Math.max(1,j.height),!1),H.aspect=Math.max(1,j.width)/Math.max(1,j.height),H.updateProjectionMatrix()};le();let Ae=new ResizeObserver(le);Ae.observe(P);let fe=j=>{de=!0,ee=j.clientX,P.setPointerCapture?.(j.pointerId)},ue=j=>{de&&(ne+=(j.clientX-ee)*.012,ee=j.clientX)},Ee=()=>{de=!1},Le=j=>{j.preventDefault(),H.position.z=Math.max(5.2,Math.min(10,H.position.z+j.deltaY*.006))};P.addEventListener("pointerdown",fe),P.addEventListener("pointermove",ue),P.addEventListener("pointerup",Ee),P.addEventListener("pointercancel",Ee),P.addEventListener("wheel",Le,{passive:!1});let Ue=new Xs,z=()=>{let j=Ue.getElapsedTime();de||(ne+=.003),ae.rotation.y=ne,ae.position.y=.05+Math.sin(j*1.2)*.015,nt.forEach((q,se)=>{q.rotation.x=q.userData.baseX+Math.sin(j*1.35+q.userData.phase)*(.015+(100-T)*15e-5),q.rotation.y=Math.sin(j*.9+se)*.018}),V.render(Z,H),oe=requestAnimationFrame(z)};return z(),()=>{cancelAnimationFrame(oe),Ae.disconnect(),P.removeEventListener("pointerdown",fe),P.removeEventListener("pointermove",ue),P.removeEventListener("pointerup",Ee),P.removeEventListener("pointercancel",Ee),P.removeEventListener("wheel",Le),Me.forEach(j=>j.dispose()),Ie.forEach(j=>j.dispose()),V.dispose()}},[g,_,R,v,T,C,N,L,O,w]),React.createElement("canvas",{ref:D,className:"plant-3d-canvas",tabIndex:"0","aria-label":"Interactive WebGL cassava model. Drag to rotate and scroll to zoom."})}function y({r:g,onRetake:_}){let{t:R,lang:v}=window.CG.Store.useStore(),T=g.top3[0];return React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"grid",title:v==="th"?"\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E40\u0E0B\u0E19\u0E40\u0E0B\u0E2D\u0E23\u0E4C":"Sensor CSV Analysis",sub:`${g.rows} rows`}),React.createElement("div",{className:"flex items-center gap-4 mb-4"},React.createElement(f,{value:T.confidence*100,label:R("confidence")}),React.createElement("div",null,React.createElement(a,{tone:T.key,dot:!0},v==="th"?T.th:T.en),React.createElement("div",{className:"grid grid-cols-2 gap-2 mt-3 text-sm"},Object.entries(g.aggregates).map(([C,N])=>React.createElement("div",{key:C,className:"glass rounded-lg px-2.5 py-1.5"},React.createElement("div",{className:"txt-dim text-[10px] uppercase"},C.replace("_"," ")),React.createElement("div",{className:"txt font-semibold"},N)))))),React.createElement(u,{items:g.top3.map(C=>({key:C.key,label:v==="th"?C.th:C.en,value:C.confidence}))}),React.createElement("button",{onClick:_,className:"w-full mt-4 glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium"},React.createElement(r,{name:"history",className:"w-4 h-4"}),v==="th"?"\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48":"Retake"))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Predict=x})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Segmented:r,Spinner:o,Skeleton:l}=window.CG.UI,{LineChart:c}=window.CG.Charts,f=[{value:"ndvi",label:"NDVI"},{value:"ndwi",label:"NDMI"},{value:"savi",label:"SAVI"},{value:"evi",label:"EVI"}],p={ndvi:"NDVI",ndwi:"NDMI",savi:"SAVI",evi:"EVI"},u=(M,m)=>m==null?"#334155":M==="ndwi"?m>.2?"#0369a1":m>0?"#38bdf8":m>-.2?"#fcd34d":"#b45309":m>.6?"#065f46":m>.45?"#10b981":m>.3?"#fbbf24":"#dc2626";function d({initialField:M}){let{t:m,lang:h,toast:S}=window.CG.Store.useStore(),[E,y]=i([]),[g,_]=i(M||null),[R,v]=i("ndvi"),[T,C]=i(null),[N,L]=i(null),[O,w]=i(null),[D,P]=i(0),[V,Z]=i(null);e(()=>{window.CG.API_CLIENT.fields().then(B=>{y(B),!g&&B.length&&_(B[0].id)})},[]),e(()=>{if(!g)return;C(null),L(null),Z(null);let B=window.CG.API_CLIENT;B.satTimeline(g,12).then(F=>{C(F.series),P(F.series.length-1)}).catch(F=>S(F.message,"error")),B.satPasses(g).then(F=>L(F.passes)).catch(()=>{})},[g]),e(()=>{if(!g||!T)return;let B=T[D]?.date;window.CG.API_CLIENT.satGrid(g,R,B).then(w).catch(()=>{})},[g,R,D,T]),e(()=>{g&&window.CG.API_CLIENT.satCompare(g,R,"","").then(Z).catch(()=>{})},[R,g]);let H=T?T[D]:null;return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement(x,{fields:E,fid:g,setFid:_}),React.createElement("div",{className:"flex items-center gap-2"},H?.data_source&&React.createElement(s,{tone:H.data_source.mode==="live"?"online":"medium",dot:!0},H.data_source.mode==="live"?h==="th"?"Sentinel-2 L2A \xB7 \u0E20\u0E32\u0E1E\u0E08\u0E23\u0E34\u0E07":"Sentinel-2 L2A \xB7 observed":h==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E25\u0E2D\u0E07":"Synthetic"),React.createElement(r,{options:f,value:R,onChange:v}))),React.createElement("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4"},["ndvi","ndwi","savi","evi"].map((B,F)=>React.createElement(t,{key:B,hover:!0,className:"animate-fadeup",style:{animationDelay:F*50+"ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},p[B]),React.createElement(a,{name:"satellite",className:"w-4 h-4 text-cyan2-light"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2 tabular-nums"},H?H[B]:React.createElement(l,{className:"h-7 w-16"})),React.createElement("div",{className:"h-1.5 rounded-full mt-2 overflow-hidden bg-white/5"},React.createElement("div",{className:"h-full rounded-full",style:{width:H?Math.min(100,Math.max(0,(H[B]+(B==="ndwi"?1:0))/(B==="ndwi"?2:1)*100))+"%":0,background:u(B,H?H[B]:0)}}))))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"grid",title:`${R.toUpperCase()} ${m("risk_zones")}`,sub:H?`${H.date} \xB7 valid ${H.valid_pct??100}%`:"",right:O&&React.createElement(s,{tone:"info"},"\u03BC ",O.mean)}),O?React.createElement(React.Fragment,null,React.createElement("div",{className:"grid gap-0.5 rounded-xl overflow-hidden",style:{gridTemplateColumns:`repeat(${O.grid_size},1fr)`}},O.cells.flat().map((B,F)=>React.createElement("div",{key:F,className:"aspect-square relative group",style:{background:u(R,B)},title:B===null?"nodata/cloud":B}))),React.createElement("div",{className:"flex items-center justify-between mt-2 text-[11px] txt-dim"},React.createElement("span",null,"low"),React.createElement("div",{className:"h-2 flex-1 mx-2 rounded-full",style:{background:"linear-gradient(90deg,#dc2626,#fbbf24,#10b981,#065f46)"}}),React.createElement("span",null,"high")),O.risk_zones.length>0&&React.createElement("div",{className:"mt-3 flex items-center gap-2 text-xs"},React.createElement(a,{name:"alert",className:"w-4 h-4 text-rose-400"}),React.createElement("span",{className:"txt-soft"},O.risk_zones.length," ",m("risk_zones")," \xB7 ",h==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E40\u0E0A\u0E34\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48":"spatial anomalies detected"))):React.createElement(l,{className:"h-48"}),T&&React.createElement("div",{className:"mt-4"},React.createElement("div",{className:"flex justify-between text-[11px] txt-dim mb-1"},React.createElement("span",null,m("time_slider")),React.createElement("span",{className:"txt-soft font-mono"},H?.date)),React.createElement("input",{type:"range",min:"0",max:T.length-1,value:D,onChange:B=>P(Number(B.target.value)),className:"w-full"}))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"satellite",title:m("trend"),sub:"12 months \xB7 all indices"}),T?React.createElement(c,{height:220,labels:T.map(B=>B.date.slice(2,7)),series:[{label:"NDVI",data:T.map(B=>B.ndvi),color:"#10b981"},{label:"NDMI",data:T.map(B=>B.ndwi),color:"#06b6d4"},{label:"SAVI",data:T.map(B=>B.savi),color:"#f59e0b"},{label:"EVI",data:T.map(B=>B.evi),color:"#8b5cf6"}],opts:{scales:{y:{min:-.5,max:1,grid:{color:"rgba(148,163,184,.12)"},ticks:{color:"#93a4bd",font:{size:9}}},x:{grid:{display:!1},ticks:{color:"#93a4bd",font:{size:9}}}}}}):React.createElement(l,{className:"h-52"}))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"grid",title:m("compare"),sub:V?`\u0394\u03BC ${V.delta_mean>0?"+":""}${V.delta_mean}`:""}),V?React.createElement("div",{className:"grid grid-cols-2 gap-3"},[["a",h==="th"?"\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32":"Earlier"],["b",h==="th"?"\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19":"Latest"]].map(([B,F])=>React.createElement("div",{key:B},React.createElement("div",{className:"flex justify-between text-xs mb-1.5"},React.createElement("span",{className:"txt-soft"},F),React.createElement("span",{className:"txt-dim font-mono"},V[B].date)),React.createElement("div",{className:"grid gap-px rounded-lg overflow-hidden",style:{gridTemplateColumns:`repeat(${V[B].grid_size},1fr)`}},V[B].cells.flat().map((re,ae)=>React.createElement("div",{key:ae,className:"aspect-square",style:{background:u(R,re)}}))),React.createElement("div",{className:"text-center txt-dim text-[11px] mt-1"},"\u03BC ",V[B].mean)))):React.createElement(l,{className:"h-40"})),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"satellite",title:m("sat_timeline"),sub:h==="th"?"\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E08\u0E23\u0E34\u0E07\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Actual recent acquisitions"}),N?React.createElement("div",{className:"space-y-2 max-h-64 overflow-y-auto no-scrollbar"},N.slice().reverse().map((B,F)=>React.createElement("div",{key:F,className:`flex items-center gap-3 rounded-xl px-3 py-2 ${B.future?"border border-dashed hair":"glass"}`},React.createElement("div",{className:`w-2 h-2 rounded-full shrink-0 ${B.usable?"bg-brand-400":"bg-amber-400"}`}),React.createElement("span",{className:"txt text-sm font-mono"},B.date),React.createElement("span",{className:"txt-soft text-xs"},B.satellite),React.createElement("div",{className:"flex-1"}),B.future?React.createElement(s,{tone:"info"},h==="th"?"\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E01\u0E32\u0E23":"scheduled"):React.createElement(s,{tone:B.usable?"low":"medium"},B.cloud_pct,"% cloud")))):React.createElement(l,{className:"h-40"}))))}function x({fields:M,fid:m,setFid:h}){let{lang:S}=window.CG.Store.useStore();return React.createElement("select",{value:m||"",onChange:E=>h(Number(E.target.value)),className:"glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},M.map(E=>React.createElement("option",{key:E.id,value:E.id,className:"bg-ink-800"},S==="th"&&E.name_th||E.name)))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Satellite=d,window.CG.FieldPicker=x})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r}=window.CG.UI,{LineChart:o,BarChart:l}=window.CG.Charts,c={sunny:"sun",partly_cloudy:"cloud",cloudy:"cloud",rain:"drop",storm:"drop"};function f({initialField:p}){let{t:u,lang:d,toast:x}=window.CG.Store.useStore(),[M,m]=i([]),[h,S]=i(p||null),[E,y]=i(null),[g,_]=i(null),[R,v]=i(null);e(()=>{window.CG.API_CLIENT.fields().then(C=>{m(C),!h&&C.length&&S(C[0].id)})},[]),e(()=>{let C=window.CG.API_CLIENT;y(null),_(null),v(null),C.weatherCurrent(h).then(y).catch(N=>x(N.message,"error")),C.weatherHistory(h,30).then(N=>_(N.series)).catch(()=>{}),C.weatherForecast(h,7).then(N=>v(N.series)).catch(()=>{})},[h]);let T=E?[{icon:"temp",label:d==="th"?"\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34":"Temperature",v:E.temp_c,u:"\xB0C",tone:"amber"},{icon:"drop",label:d==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E0A\u0E37\u0E49\u0E19":"Humidity",v:E.humidity_pct,u:"%",tone:"cyan"},{icon:"cloud",label:d==="th"?"\u0E1D\u0E19":"Rainfall",v:E.rainfall_mm,u:"mm",tone:"cyan"},{icon:"wind",label:d==="th"?"\u0E25\u0E21":"Wind",v:E.wind_kmh,u:"km/h",tone:"brand"},{icon:"sun",label:d==="th"?"\u0E23\u0E31\u0E07\u0E2A\u0E35\u0E14\u0E27\u0E07\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C":"Solar",v:E.solar_mj,u:"MJ",tone:"amber"}]:[];return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex items-center justify-between"},window.CG.FieldPicker&&React.createElement(window.CG.FieldPicker,{fields:M,fid:h,setFid:S}),React.createElement("div",{className:"flex items-center gap-2"},E?.data_source&&React.createElement(s,{tone:E.data_source.mode==="live"?"online":"medium",dot:!0},E.data_source.mode==="live"?d==="th"?"Open-Meteo \xB7 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E14":"Open-Meteo \xB7 live":d==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E25\u0E2D\u0E07":"Synthetic"),E&&React.createElement(s,{tone:"info"},d==="th"?E.condition_th:E.condition.replace("_"," ")))),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup relative overflow-hidden"},React.createElement("div",{className:"absolute -right-10 -top-10 w-40 h-40 rounded-full grad-brand opacity-10 blur-2xl"}),E?React.createElement("div",{className:"flex items-center gap-5"},React.createElement("div",{className:"w-20 h-20 rounded-3xl grad-brand grid place-items-center text-white animate-floaty"},React.createElement(a,{name:c[E.condition]||"cloud",className:"w-10 h-10"})),React.createElement("div",null,React.createElement("div",{className:"txt text-5xl font-bold tabular-nums"},E.temp_c,"\xB0"),React.createElement("div",{className:"txt-soft text-sm mt-1"},E.temp_min,"\xB0 / ",E.temp_max,"\xB0"))):React.createElement(r,{className:"h-20"})),React.createElement("div",{className:"lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3"},T.map((C,N)=>React.createElement(t,{key:N,hover:!0,className:"animate-fadeup",style:{animationDelay:N*40+"ms"}},React.createElement(a,{name:C.icon,className:"w-5 h-5 text-cyan2-light"}),React.createElement("div",{className:"txt text-xl font-bold mt-2 tabular-nums"},C.v,React.createElement("span",{className:"text-xs txt-soft ml-0.5"},C.u)),React.createElement("div",{className:"txt-dim text-[11px] mt-0.5"},C.label))))),React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"cloud",title:u("forecast")}),R?React.createElement("div",{className:"grid grid-cols-7 gap-2"},R.map((C,N)=>React.createElement("div",{key:N,className:"glass rounded-xl p-3 text-center card-hover"},React.createElement("div",{className:"txt-dim text-[11px]"},new Date(C.date).toLocaleDateString(d==="th"?"th-TH":"en",{weekday:"short"})),React.createElement(a,{name:c[C.condition]||"cloud",className:"w-6 h-6 mx-auto my-2 text-cyan2-light"}),React.createElement("div",{className:"txt font-bold text-sm"},C.temp_max,"\xB0"),React.createElement("div",{className:"txt-dim text-[11px]"},C.temp_min,"\xB0"),React.createElement("div",{className:"text-[11px] text-cyan2-light mt-1"},C.rainfall_mm,"mm")))):React.createElement(r,{className:"h-28"})),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"temp",title:`${u("trend")} \xB7 ${d==="th"?"\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34 & \u0E04\u0E27\u0E32\u0E21\u0E0A\u0E37\u0E49\u0E19":"Temp & Humidity"}`,sub:"30 days"}),g?React.createElement(o,{height:220,labels:g.map(C=>C.date.slice(5)),series:[{label:"Temp \xB0C",data:g.map(C=>C.temp_c),color:"#f59e0b"},{label:"Humidity %",data:g.map(C=>C.humidity_pct),color:"#06b6d4"}]}):React.createElement(r,{className:"h-52"})),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"cloud",title:`${u("trend")} \xB7 ${d==="th"?"\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E1D\u0E19":"Rainfall"}`,sub:"30 days"}),g?React.createElement(l,{height:220,labels:g.map(C=>C.date.slice(5)),series:[{label:"Rain mm",data:g.map(C=>C.rainfall_mm),color:"#06b6d4"}]}):React.createElement(r,{className:"h-52"}))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Weather=f})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r,Empty:o,Segmented:l}=window.CG.UI,c={nutrient:"soil",water:"drop",disease:"brain",weather:"cloud",info:"check"};function f({initialField:u}){let{t:d,lang:x,toast:M}=window.CG.Store.useStore(),[m,h]=i([]),[S,E]=i(u||"all"),[y,g]=i(null),[_,R]=i("all");e(()=>{window.CG.API_CLIENT.fields().then(h)},[]),e(()=>{g(null);let C=window.CG.API_CLIENT;(async()=>{try{if(S==="all"){let L=await C.fields(),O=await Promise.all(L.map(D=>C.field(D.id))),w=[];O.forEach(D=>D.recommendations.forEach(P=>w.push({...P,field:D.name,field_th:D.name_th,field_id:D.id}))),w.sort((D,P)=>({high:0,medium:1,info:2})[D.severity]-{high:0,medium:1,info:2}[P.severity]||P.confidence-D.confidence),g(w)}else{let L=await C.field(S);g(L.recommendations.map(O=>({...O,field:L.name,field_th:L.name_th,field_id:L.id})))}}catch(L){M(L.message,"error")}})()},[S]);let v=y?y.filter(C=>_==="all"||C.kind===_):null,T=y?{high:y.filter(C=>C.severity==="high").length,medium:y.filter(C=>C.severity==="medium").length,total:y.length}:{high:0,medium:0,total:0};return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement("select",{value:S,onChange:C=>E(C.target.value==="all"?"all":Number(C.target.value)),className:"glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"all",className:"bg-ink-800"},d("all_fields")),m.map(C=>React.createElement("option",{key:C.id,value:C.id,className:"bg-ink-800"},x==="th"&&C.name_th||C.name)))),React.createElement(l,{value:_,onChange:R,options:[{value:"all",label:x==="th"?"\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14":"All"},{value:"nutrient",label:x==="th"?"\u0E18\u0E32\u0E15\u0E38\u0E2D\u0E32\u0E2B\u0E32\u0E23":"Nutrient"},{value:"water",label:x==="th"?"\u0E19\u0E49\u0E33":"Water"},{value:"disease",label:x==="th"?"\u0E42\u0E23\u0E04":"Disease"}]})),React.createElement("div",{className:"grid grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-rose-500/15 text-rose-300 grid place-items-center"},React.createElement(a,{name:"alert"})),React.createElement("div",null,React.createElement("div",{className:"txt text-2xl font-bold"},T.high),React.createElement("div",{className:"txt-dim text-xs"},d("high"))))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement("div",{className:"flex items-center gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 grid place-items-center"},React.createElement(a,{name:"bell"})),React.createElement("div",null,React.createElement("div",{className:"txt text-2xl font-bold"},T.medium),React.createElement("div",{className:"txt-dim text-xs"},d("medium"))))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"120ms"}},React.createElement("div",{className:"flex items-center gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center"},React.createElement(a,{name:"bulb"})),React.createElement("div",null,React.createElement("div",{className:"txt text-2xl font-bold"},T.total),React.createElement("div",{className:"txt-dim text-xs"},d("recommendation")))))),v?v.length===0?React.createElement(t,null,React.createElement(o,{icon:"check",text:x==="th"?"\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E43\u0E19\u0E2B\u0E21\u0E27\u0E14\u0E19\u0E35\u0E49":"No recommendations in this category"})):React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},v.map((C,N)=>React.createElement(p,{key:N,r:C,delay:N*50}))):React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},[0,1,2,3].map(C=>React.createElement(t,{key:C},React.createElement(r,{className:"h-40"})))))}function p({r:u,delay:d}){let{lang:x}=window.CG.Store.useStore(),M=x==="th"?u.actions_th:u.actions_en;return React.createElement(t,{hover:!0,className:"animate-fadeup relative overflow-hidden",style:{animationDelay:d+"ms"}},React.createElement("div",{className:`absolute left-0 top-0 bottom-0 w-1 ${u.severity==="high"?"bg-rose-500":u.severity==="medium"?"bg-amber-500":"bg-brand-500"}`}),React.createElement("div",{className:"flex items-start justify-between gap-2 mb-3 pl-2"},React.createElement("div",{className:"flex items-center gap-2.5"},React.createElement("div",{className:`w-9 h-9 rounded-xl grid place-items-center ${u.severity==="high"?"bg-rose-500/15 text-rose-300":u.severity==="medium"?"bg-amber-500/15 text-amber-300":"bg-brand-500/15 text-brand-300"}`},React.createElement(a,{name:c[u.kind]||"bulb",className:"w-5 h-5"})),React.createElement("div",null,React.createElement("h4",{className:"txt font-semibold text-sm leading-tight"},x==="th"?u.title_th:u.title_en),u.field&&React.createElement("div",{className:"txt-dim text-[11px] mt-0.5"},x==="th"&&u.field_th||u.field))),React.createElement(s,{tone:u.severity},Math.round(u.confidence*100),"%")),React.createElement("div",{className:"pl-2"},React.createElement("div",{className:"txt-dim text-[11px] font-semibold uppercase mb-1.5"},x==="th"?"\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19":"Evidence"),React.createElement("ul",{className:"space-y-1 mb-3"},u.evidence.map((m,h)=>React.createElement("li",{key:h,className:"flex items-start gap-2 txt-soft text-xs"},React.createElement("span",{className:"w-1.5 h-1.5 rounded-full bg-cyan2 mt-1.5 shrink-0"}),x==="th"?m.th:m.en))),React.createElement("div",{className:"txt-dim text-[11px] font-semibold uppercase mb-1.5"},x==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33":"Actions"),React.createElement("ul",{className:"space-y-1"},M.map((m,h)=>React.createElement("li",{key:h,className:"flex items-start gap-2 txt text-xs"},React.createElement(a,{name:"check",className:"w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0"}),m))),React.createElement("div",{className:"mt-3 flex items-center gap-2"},React.createElement("div",{className:"flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden"},React.createElement("div",{className:"h-full grad-brand rounded-full",style:{width:u.confidence*100+"%",transition:"width 1s"}})),React.createElement("span",{className:"txt-dim text-[10px]"},x==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E31\u0E48\u0E19":"confidence"))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Recommendations=f})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r,Empty:o,Modal:l,ProgressRing:c}=window.CG.UI,{ProbBars:f}=window.CG.Charts;function p(){let{t:d,lang:x,toast:M}=window.CG.Store.useStore(),[m,h]=i(null),[S,E]=i(""),[y,g]=i(""),[_,R]=i(null),[v,T]=i([]),C=()=>{let P={};S&&(P.q=S),y&&(P.top_class=y),window.CG.API_CLIENT.history(P).then(V=>h(V.items)).catch(V=>M(V.message,"error"))};e(()=>{window.CG.API_CLIENT.classes().then(T)},[]),e(()=>{let P=setTimeout(C,250);return()=>clearTimeout(P)},[S,y]);let N=P=>window.CG.API_CLIENT.historyDetail(P).then(R).catch(V=>M(V.message,"error")),L=async P=>{let V=x==="th"?`\u0E25\u0E1A\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C #${P.id} \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E16\u0E32\u0E27\u0E23\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48?`:`Permanently delete prediction #${P.id} and its related images?`;if(window.confirm(V))try{await window.CG.API_CLIENT.deletePrediction(P.id),_?.id===P.id&&R(null),M(x==="th"?"\u0E25\u0E1A\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E41\u0E25\u0E49\u0E27":"Prediction deleted","success"),C()}catch(Z){M(Z.message,"error")}},O=P=>String(P??"").replace(/[&<>"']/g,V=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[V]),w=async()=>{try{let P=await window.CG.API_CLIENT.exportCsv();if(!P.ok)throw new Error("Export failed");let V=await P.blob(),Z=URL.createObjectURL(V),H=document.createElement("a");H.href=Z,H.download="cassavaguard_predictions.csv",H.click(),URL.revokeObjectURL(Z)}catch(P){M(P.message,"error")}},D=()=>{if(!m||!m.length){M(d("no_data"),"warn");return}let P=window.open("","_blank"),V=m.map(Z=>`<tr><td>${Z.id}</td><td>${O(Z.created_at.replace("T"," ").slice(0,16))}</td><td>${O(Z.source)}</td><td>${O(Z.top_class)}</td><td>${(Z.confidence*100).toFixed(1)}%</td><td>${O(Z.field_name||"-")}</td></tr>`).join("");P.document.write(`<html><head><title>CassavaGuard Prediction Report</title>
        <style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#0b1a2b}h1{color:#059669}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#ecfdf5}</style>
        </head><body><h1>\u{1F33F} CassavaGuard AI \u2014 Prediction Report</h1><p>Generated ${new Date().toLocaleString()} \xB7 ${m.length} records</p>
        <table><thead><tr><th>ID</th><th>Date</th><th>Source</th><th>Class</th><th>Confidence</th><th>Field</th></tr></thead><tbody>${V}</tbody></table>
        <script>setTimeout(()=>window.print(),400)<\/script></body></html>`),P.document.close()};return React.createElement("div",{className:"space-y-5"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"history",title:d("nav_history"),sub:m?`${m.length} records`:"",right:React.createElement("div",{className:"flex gap-2"},React.createElement("button",{onClick:w,className:"glass rounded-xl px-3 py-1.5 text-xs txt-soft hover:txt flex items-center gap-1.5"},React.createElement(a,{name:"download",className:"w-3.5 h-3.5"}),d("export_csv")),React.createElement("button",{onClick:D,className:"glass rounded-xl px-3 py-1.5 text-xs txt-soft hover:txt flex items-center gap-1.5"},React.createElement(a,{name:"download",className:"w-3.5 h-3.5"}),d("export_pdf")))}),React.createElement("div",{className:"flex flex-wrap gap-2 mb-4"},React.createElement("div",{className:"relative flex-1 min-w-[200px]"},React.createElement(a,{name:"search",className:"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 txt-dim"}),React.createElement("input",{value:S,onChange:P=>E(P.target.value),placeholder:d("search"),className:"w-full glass rounded-xl pl-9 pr-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"})),React.createElement("select",{value:y,onChange:P=>g(P.target.value),className:"glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"",className:"bg-ink-800"},d("all_fields")),v.map(P=>React.createElement("option",{key:P.key,value:P.key,className:"bg-ink-800"},x==="th"?P.th:P.en)))),m?m.length===0?React.createElement(o,{icon:"history",text:d("no_data")}):React.createElement("div",{className:"overflow-x-auto"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},["ID",x==="th"?"\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48":"Date",x==="th"?"\u0E41\u0E2B\u0E25\u0E48\u0E07":"Source",x==="th"?"\u0E1C\u0E25":"Result",d("confidence"),x==="th"?"\u0E41\u0E1B\u0E25\u0E07":"Field",""].map((P,V)=>React.createElement("th",{key:V,className:"text-left font-medium py-2 px-2"},P)))),React.createElement("tbody",null,m.map(P=>{let V=v.find(Z=>Z.key===P.top_class)||{th:P.top_class,en:P.top_class};return React.createElement("tr",{key:P.id,className:"border-b hair hover:bg-white/[.02] transition"},React.createElement("td",{className:"py-2.5 px-2 txt-dim font-mono text-xs"},"#",P.id),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-xs"},P.created_at.replace("T"," ").slice(0,16)),React.createElement("td",{className:"py-2.5 px-2"},React.createElement("span",{className:"txt-soft text-xs capitalize"},P.source)),React.createElement("td",{className:"py-2.5 px-2"},React.createElement(s,{tone:P.top_class||"slate"},x==="th"?V.th:V.en)),React.createElement("td",{className:"py-2.5 px-2 txt font-mono text-xs tabular-nums"},(P.confidence*100).toFixed(1),"%"),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-xs"},P.field_name||"\u2014"),React.createElement("td",{className:"py-2.5 px-2"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement("button",{onClick:()=>N(P.id),title:x==="th"?"\u0E14\u0E39\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14":"View details",className:"txt-soft hover:text-brand-400"},React.createElement(a,{name:"chevron",className:"w-4 h-4"})),React.createElement("button",{onClick:()=>L(P),title:x==="th"?"\u0E25\u0E1A\u0E1C\u0E25\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E":"Delete result and images",className:"txt-dim hover:text-rose-400"},React.createElement(a,{name:"close",className:"w-4 h-4"})))))})))):React.createElement(r,{className:"h-64"})),React.createElement(l,{open:!!_,onClose:()=>R(null),title:_?`Prediction #${_.id}`:"",wide:!0},_&&React.createElement(u,{d:_,classes:v})))}function u({d,classes:x}){let{lang:M,t:m}=window.CG.Store.useStore(),{useState:h}=React,[S,E]=h(!0),y=x.find(g=>g.key===d.top_class)||{th:d.top_class,en:d.top_class};return React.createElement("div",{className:"grid md:grid-cols-2 gap-5"},React.createElement("div",null,(d.image_url||d.heatmap_url)&&React.createElement("div",{className:"relative rounded-xl overflow-hidden bg-black/20 grid place-items-center min-h-[180px] mb-3"},React.createElement("img",{src:S&&d.heatmap_url?d.heatmap_url:d.image_url,alt:"prediction",className:"w-full object-contain max-h-[220px]"}),d.image_url&&d.heatmap_url&&React.createElement("div",{className:"absolute bottom-2 right-2 flex gap-1"},React.createElement("button",{onClick:()=>E(!1),className:`text-[11px] px-2 py-1 rounded-lg ${S?"glass-strong txt-soft":"grad-brand text-white"}`},"Original"),React.createElement("button",{onClick:()=>E(!0),className:`text-[11px] px-2 py-1 rounded-lg ${S?"grad-brand text-white":"glass-strong txt-soft"}`},M==="th"?"\u0E08\u0E38\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D":"Attribution"))),React.createElement("div",{className:"flex items-center gap-4 mb-4"},React.createElement(c,{value:d.confidence*100,label:m("confidence")}),React.createElement("div",null,React.createElement(s,{tone:d.top_class||"slate",dot:!0},M==="th"?y.th:y.en),React.createElement("div",{className:"txt-dim text-xs mt-2 font-mono"},d.model_id),React.createElement("div",{className:"txt-dim text-xs"},d.inference_ms," ms \xB7 ",d.source))),d.symptoms&&d.symptoms.length>0&&React.createElement("div",{className:"mb-3"},React.createElement("div",{className:"txt-dim text-xs font-semibold uppercase mb-1.5"},m("symptoms")),d.symptoms.map((g,_)=>React.createElement("div",{key:_,className:"txt-soft text-xs flex items-center gap-2 mb-1"},React.createElement("span",{className:"w-1.5 h-1.5 rounded-full bg-cyan2"}),M==="th"?g.th:g.en))),React.createElement("div",{className:"glass rounded-xl p-3"},React.createElement("div",{className:"txt-dim text-xs font-semibold mb-1"},m("explain")),React.createElement("p",{className:"txt-soft text-xs leading-relaxed"},M==="th"?d.explanation_th:d.explanation))),React.createElement("div",null,React.createElement("div",{className:"txt-dim text-xs font-semibold uppercase mb-2"},m("prob_dist")),d.probs&&React.createElement(f,{items:Object.entries(d.probs).map(([g,_])=>{let R=x.find(v=>v.key===g)||{th:g,en:g};return{key:g,label:M==="th"?R.th:R.en,value:_}}).sort((g,_)=>_.value-g.value),height:220}),d.feature_importance&&d.feature_importance.length>0&&React.createElement("div",{className:"mt-3 space-y-2"},d.feature_importance.map((g,_)=>React.createElement("div",{key:_},React.createElement("div",{className:"flex justify-between text-[11px] mb-1"},React.createElement("span",{className:"txt-soft"},g.feature),React.createElement("span",{className:"txt-dim"},(g.importance*100).toFixed(0),"%")),React.createElement("div",{className:"h-1.5 bg-white/5 rounded-full overflow-hidden"},React.createElement("div",{className:"h-full grad-brand rounded-full",style:{width:g.importance*100+"%"}})))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.History=p})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r}=window.CG.UI,{RadarChart:o,BarChart:l}=window.CG.Charts;function c(){let{t:f,lang:p,toast:u,user:d}=window.CG.Store.useStore(),[x,M]=i(null),[m,h]=i(null),[S,E]=i(null),[y,g]=i(null),[_,R]=i(null),v=w=>w==null?"\u2014":`${(w*100).toFixed(1)}%`,T=new Set(["healthy","cbb","cbsd","cmd","cgm"]),C=["#10b981","#06b6d4","#f59e0b","#8b5cf6","#f43f5e","#14b8a6","#84cc16","#3b82f6","#e879f9","#fb7185"],N=w=>({serving_trained_model:p==="th"?"\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07":"serving",serving_trained_auxiliary_model:p==="th"?"\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07 \xB7 \u0E2B\u0E31\u0E27\u0E40\u0E2A\u0E23\u0E34\u0E21":"serving \xB7 auxiliary",serving_experimental_auxiliary_model:p==="th"?"\u0E17\u0E14\u0E25\u0E2D\u0E07\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33":"experimental \xB7 review required",serving_experimental_detector:p==="th"?"\u0E15\u0E31\u0E27\u0E15\u0E23\u0E27\u0E08\u0E08\u0E31\u0E1A\u0E17\u0E14\u0E25\u0E2D\u0E07 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33":"experimental detector \xB7 review required",dataset_available_training_required:p==="th"?"\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \xB7 \u0E23\u0E2D\u0E1D\u0E36\u0E01":"data ready \xB7 train pending",real_dataset_downloaded_training_required:p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E1E\u0E23\u0E49\u0E2D\u0E21 \xB7 \u0E23\u0E2D\u0E1D\u0E36\u0E01":"real data ready \xB7 train pending",real_dataset_downloaded_detector_training_required:p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E23\u0E2D\u0E1A\u0E27\u0E31\u0E15\u0E16\u0E38\u0E1E\u0E23\u0E49\u0E2D\u0E21 \xB7 \u0E23\u0E2D\u0E1D\u0E36\u0E01":"boxed data ready \xB7 detector pending",real_data_insufficient_synthetic_seed:p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E22\u0E31\u0E07\u0E19\u0E49\u0E2D\u0E22 \xB7 \u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"real data insufficient \xB7 synthetic seed",synthetic_seed_real_data_required:p==="th"?"\u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E2B\u0E32\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07":"synthetic seed \xB7 real data required",synthetic_seed_real_paired_data_required:p==="th"?"\u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E01\u0E47\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E08\u0E31\u0E1A\u0E04\u0E39\u0E48":"synthetic seed \xB7 paired real data required",blocked_missing_labeled_images:p==="th"?"\u0E02\u0E32\u0E14\u0E20\u0E32\u0E1E\u0E15\u0E34\u0E14\u0E1B\u0E49\u0E32\u0E22":"blocked \xB7 missing labelled images",blocked_missing_paired_labels:p==="th"?"\u0E02\u0E32\u0E14\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E31\u0E1A\u0E04\u0E39\u0E48":"blocked \xB7 missing paired labels"})[w]||w,L=w=>w.startsWith("serving_trained_")?"online":["serving_experimental_auxiliary_model","serving_experimental_detector"].includes(w)||w.includes("dataset_downloaded")||w==="dataset_available_training_required"?"medium":"slate";e(()=>{let w=window.CG.API_CLIENT;w.models().then(M).catch(P=>u(P.message,"error")),w.modelCompare().then(h).catch(()=>{}),w.systemStatus().then(E).catch(()=>{}),d.role==="admin"&&(w.logs().then(g).catch(()=>g([])),w.adminUsers().then(R).catch(()=>R([])));let D=setInterval(()=>w.systemStatus().then(E).catch(()=>{}),5e3);return()=>clearInterval(D)},[]);let O=async(w,D)=>{try{await window.CG.API_CLIENT.updateUserRole(w,D),R(await window.CG.API_CLIENT.adminUsers()),u(p==="th"?"\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E1A\u0E17\u0E1A\u0E32\u0E17\u0E41\u0E25\u0E49\u0E27":"Role updated","success")}catch(P){u(P.message,"error")}};return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"grid md:grid-cols-4 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},f("server_status")),React.createElement("span",{className:"w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2"},S?"Online":React.createElement(r,{className:"h-7 w-20"})),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},S?`uptime ${Math.floor(S.server.uptime_s/60)}m \xB7 load ${S.server.load_1m}`:"")),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"50ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},"Compute"),React.createElement(a,{name:"cpu",className:"w-4 h-4 text-cyan2-light"})),React.createElement("div",{className:"txt text-lg font-bold mt-2"},S?S.gpu.device:React.createElement(r,{className:"h-6 w-24"})),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},S?S.gpu.backend:"")),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"100ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},"Inference"),React.createElement(a,{name:"brain",className:"w-4 h-4 text-brand-400"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2 tabular-nums"},S&&S.inference.avg_ms!=null?S.inference.avg_ms:"\u2014",S&&S.inference.avg_ms!=null&&React.createElement("span",{className:"text-sm txt-soft"},"ms")),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},S&&S.inference.throughput_img_s!=null?`${S.inference.throughput_img_s} img/s`:p==="th"?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07":"No samples yet")),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"150ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},"Dataset"),React.createElement(a,{name:"grid",className:"w-4 h-4 text-violet-400"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2 tabular-nums"},S?(S.dataset.train+S.dataset.val+S.dataset.test).toLocaleString():"\u2013"),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},S?p==="th"?`${S.dataset.classes} \u0E04\u0E25\u0E32\u0E2A\u0E17\u0E35\u0E48\u0E40\u0E17\u0E23\u0E19 \xB7 ${S.dataset.reference_only_classes||0} \u0E04\u0E25\u0E32\u0E2A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07`:`${S.dataset.classes} trained \xB7 ${S.dataset.reference_only_classes||0} reference-only`:""),S&&!S.dataset.field_validated&&React.createElement("div",{className:"text-amber-300 text-[10px] mt-1"},p==="th"?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2D\u0E34\u0E2A\u0E23\u0E30\u0E01\u0E31\u0E1A\u0E20\u0E32\u0E1E\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E17\u0E22":"Not independently validated on Thai field photos"))),React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"cpu",title:p==="th"?"\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E42\u0E21\u0E40\u0E14\u0E25":"Model Registry",right:x&&React.createElement(s,{tone:"brand"},"active \xB7 ",x.active)}),x?React.createElement("div",{className:"overflow-x-auto"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},["Model","Version","Accuracy","F1 / mAP50","Params","Size","Speed",""].map((w,D)=>React.createElement("th",{key:D,className:"text-left font-medium py-2 px-2"},w)))),React.createElement("tbody",null,x.models.filter(w=>!w.experimental&&!/brown|white/i.test(w.id)).map(w=>React.createElement("tr",{key:w.id,className:"border-b hair hover:bg-white/[.02]"},React.createElement("td",{className:"py-2.5 px-2 txt font-medium text-xs"},w.name),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},w.version),React.createElement("td",{className:"py-2.5 px-2 txt font-mono text-xs"},v(w.accuracy)),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},w.map50!=null?`mAP50 ${v(w.map50)}`:v(w.f1)),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},w.params_m!=null?w.params_m+"M":"\u2014"),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},w.size_mb!=null?w.size_mb+"MB":"\u2014"),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},w.avg_inference_ms!=null?w.avg_inference_ms+"ms":"\u2014"),React.createElement("td",{className:"py-2.5 px-2"},w.experimental?React.createElement(s,{tone:"medium"},w.runtime_enabled?p==="th"?"\u0E17\u0E14\u0E25\u0E2D\u0E07 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33":"experimental \xB7 review only":p==="th"?"\u0E17\u0E14\u0E25\u0E2D\u0E07 \xB7 \u0E1B\u0E34\u0E14":"experimental \xB7 off"):w.active?React.createElement(s,{tone:"online",dot:!0},"active"):React.createElement(s,{tone:"slate"},"standby"))))))):React.createElement(r,{className:"h-32"})),x?.class_readiness&&React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"check",title:p==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E02\u0E2D\u0E07\u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01\u0E17\u0E31\u0E49\u0E07 5":"Readiness of five primary classes",sub:p==="th"?"\u0E42\u0E23\u0E04 \xB7 \u0E41\u0E21\u0E25\u0E07 \xB7 \u0E20\u0E32\u0E27\u0E30\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14 \u0E43\u0E0A\u0E49\u0E2B\u0E31\u0E27\u0E42\u0E21\u0E40\u0E14\u0E25\u0E04\u0E19\u0E25\u0E30\u0E0A\u0E19\u0E34\u0E14 \u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E04\u0E30\u0E41\u0E19\u0E19\u0E1B\u0E25\u0E2D\u0E21":"Diseases, pests and stresses use separate model heads; no fabricated probabilities",right:React.createElement(s,{tone:"info"},"5/5 ",p==="th"?"\u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01":"primary classes")}),React.createElement("div",{className:"overflow-x-auto max-h-[460px]"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E04\u0E25\u0E32\u0E2A":"Class"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E07\u0E32\u0E19\u0E42\u0E21\u0E40\u0E14\u0E25":"Model task"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E2A\u0E16\u0E32\u0E19\u0E30":"Status"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25/\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25":"Data / reason"))),React.createElement("tbody",null,x.class_readiness.filter(w=>T.has(w.key)).map(w=>React.createElement("tr",{key:w.key,className:"border-b hair align-top"},React.createElement("td",{className:"py-2.5 px-2"},React.createElement("div",{className:"txt text-xs font-medium"},p==="th"?w.th:w.en),React.createElement("div",{className:"txt-dim font-mono text-[10px] mt-0.5"},w.key)),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-[11px]"},w.task),React.createElement("td",{className:"py-2.5 px-2"},React.createElement(s,{tone:L(w.status),dot:w.production_output},N(w.status))),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-[11px] max-w-md"},React.createElement("div",null,w.reason),w.dataset?.name&&React.createElement("div",{className:"txt-dim mt-1"},w.dataset.name," \xB7 ",w.dataset.license,w.dataset.images?` \xB7 ${w.dataset.images.toLocaleString()} images`:""),w.synthetic?.images>0&&React.createElement("div",{className:"text-amber-300/80 mt-1"},p==="th"?`\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C ${w.synthetic.images} \u0E20\u0E32\u0E1E \xB7 train-only \xB7 \u0E2B\u0E49\u0E32\u0E21\u0E43\u0E0A\u0E49\u0E27\u0E31\u0E14\u0E1C\u0E25`:`${w.synthetic.images} synthetic \xB7 train-only \xB7 excluded from evaluation`)))))))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"brain",title:f("model_cmp"),sub:"accuracy \xB7 F1 \xB7 precision \xB7 recall"}),m?React.createElement(o,{height:280,labels:["Accuracy","F1","Precision","Recall"],series:m.models.map((w,D)=>({label:w.name.split(" ").slice(-1)[0],data:[w.accuracy,w.f1,w.precision,w.recall].map(P=>P==null?null:Math.round(P*100)),color:C[D%C.length]}))}):React.createElement(r,{className:"h-64"})),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"cpu",title:p==="th"?"\u0E02\u0E19\u0E32\u0E14 vs \u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27":"Size vs Speed",sub:"MB \xB7 inference ms"}),m?React.createElement(l,{height:280,labels:m.models.map(w=>w.name.split(" ").slice(-1)[0]),series:[{label:"Size MB",data:m.models.map(w=>w.size_mb),color:"#8b5cf6"},{label:"Speed ms",data:m.models.map(w=>w.avg_inference_ms),color:"#06b6d4"}]}):React.createElement(r,{className:"h-64"}))),d.role==="admin"&&React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"check",title:p==="th"?"\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E41\u0E25\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C":"Users & roles",sub:p==="th"?"\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E43\u0E2B\u0E21\u0E48\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23":"New accounts start as Farmer"}),_?React.createElement("div",{className:"overflow-x-auto"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},React.createElement("th",{className:"text-left font-medium py-2 px-2"},"Email"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E0A\u0E37\u0E48\u0E2D":"Name"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E1A\u0E17\u0E1A\u0E32\u0E17":"Role"))),React.createElement("tbody",null,_.map(w=>React.createElement("tr",{key:w.id,className:"border-b hair"},React.createElement("td",{className:"py-2.5 px-2 txt font-mono text-xs"},w.email),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-xs"},w.full_name||"\u2014"),React.createElement("td",{className:"py-2.5 px-2"},React.createElement("select",{value:w.role,onChange:D=>O(w.id,D.target.value),className:"glass rounded-lg px-2 py-1 txt text-xs bg-transparent"},React.createElement("option",{value:"farmer",className:"bg-ink-800"},"Farmer"),React.createElement("option",{value:"researcher",className:"bg-ink-800"},"Researcher"),React.createElement("option",{value:"admin",className:"bg-ink-800"},"Admin")))))))):React.createElement(r,{className:"h-24"})),d.role==="admin"&&React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"history",title:f("training_logs"),sub:p==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E33\u0E02\u0E2D API \u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Recent API requests"}),y?React.createElement("div",{className:"font-mono text-[11px] space-y-1 max-h-64 overflow-y-auto no-scrollbar"},y.slice(0,40).map(w=>React.createElement("div",{key:w.id,className:"flex items-center gap-2 txt-soft"},React.createElement("span",{className:"txt-dim"},w.at.slice(11,19)),React.createElement("span",{className:`w-12 ${w.status<300?"text-brand-400":w.status<400?"text-amber-400":"text-rose-400"}`},w.status),React.createElement("span",{className:"w-14 txt-dim"},w.method),React.createElement("span",{className:"flex-1 truncate"},w.path),React.createElement("span",{className:"txt-dim tabular-nums"},w.ms,"ms")))):React.createElement(r,{className:"h-32"})))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.System=c})();(function(){let{Card:i,SectionTitle:e,Badge:t,Icon:n}=window.CG.UI,s={th:[["\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E41\u0E1B\u0E25\u0E07","\u0E44\u0E1B\u0E17\u0E35\u0E48 \u201C\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07\u201D \u0E01\u0E14 \u201C\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07\u201D \u0E41\u0E25\u0E49\u0E27\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D \u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14 \u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C \u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48 \u0E41\u0E25\u0E30\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07"],["\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E43\u0E2B\u0E49\u0E0A\u0E31\u0E14","\u0E43\u0E0A\u0E49\u0E41\u0E2A\u0E07\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34 \u0E20\u0E32\u0E1E\u0E44\u0E21\u0E48\u0E2A\u0E31\u0E48\u0E19 \u0E40\u0E2B\u0E47\u0E19\u0E43\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E49\u0E19\u0E40\u0E15\u0E47\u0E21\u0E2A\u0E48\u0E27\u0E19\u0E17\u0E35\u0E48\u0E21\u0E35\u0E2D\u0E32\u0E01\u0E32\u0E23 \u0E41\u0E25\u0E30\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E23\u0E01"],["\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI","\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E JPG/PNG \u0E41\u0E25\u0E49\u0E27\u0E01\u0E14 \u201C\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u201D \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E33\u0E41\u0E19\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30 5 \u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01"],["\u0E15\u0E23\u0E27\u0E08\u0E1C\u0E25\u0E01\u0E48\u0E2D\u0E19\u0E25\u0E07\u0E21\u0E37\u0E2D","\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08\u0E41\u0E25\u0E30\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E08\u0E23\u0E34\u0E07\u0E01\u0E48\u0E2D\u0E19\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23"],["\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E1C\u0E25","\u0E14\u0E39\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34 \u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33 \u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E41\u0E25\u0E30\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E19 \u0E44\u0E21\u0E48\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E40\u0E14\u0E35\u0E22\u0E27"]],en:[["Create a field","Open Field Map, choose Add field, then enter the real name, province, variety, area and coordinates."],["Capture a clear photo","Use daylight, avoid blur, show the affected leaf or plant clearly and keep the background simple."],["Run AI analysis","Choose a field, upload JPG/PNG, then analyze one of the five primary classes."],["Review before acting","Check confidence and review reasons against the plant before taking action."],["Monitor over time","Use History, Recommendations, Satellite and Weather together instead of relying on one photo."]]},a={th:[["\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07","\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E25\u0E30\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E14\u0E39\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15 \u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 \u0E41\u0E25\u0E30\u0E0A\u0E31\u0E49\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 NDVI/NDMI/SAVI"],["\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI","\u0E08\u0E33\u0E41\u0E19\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30 Healthy, CBB, CBSD, CMD \u0E41\u0E25\u0E30 CGM"],["\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E41\u0E25\u0E30\u0E2D\u0E32\u0E01\u0E32\u0E28","\u0E43\u0E0A\u0E49 Sentinel-2 \u0E41\u0E25\u0E30 Open-Meteo \u0E41\u0E1A\u0E1A live \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E17\u0E35\u0E48\u0E21\u0E32\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32"],["\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34","\u0E23\u0E27\u0E21\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E2B\u0E25\u0E32\u0E22\u0E41\u0E2B\u0E25\u0E48\u0E07 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E1C\u0E25 \u0E41\u0E25\u0E30\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 CSV/PDF"],["\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E30\u0E42\u0E21\u0E40\u0E14\u0E25","\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E1C\u0E25\u0E27\u0E31\u0E14\u0E42\u0E21\u0E40\u0E14\u0E25\u0E2B\u0E25\u0E31\u0E01 5 \u0E04\u0E25\u0E32\u0E2A"]],en:[["Field Map","Create and select fields; inspect boundaries, risk and NDVI/NDMI/SAVI layers."],["AI Diagnosis","Restricted to Healthy, CBB, CBSD, CMD and CGM."],["Satellite and weather","Live Sentinel-2 and Open-Meteo data with provider and timestamp provenance."],["Recommendations and history","Combines evidence, records results and exports CSV/PDF."],["System and models","Inspect server health and measured metrics for the five primary classes."]]};function r(){let{lang:o}=window.CG.Store.useStore(),l=s[o]||s.en,c=a[o]||a.en,f=o==="th";return React.createElement("div",{className:"space-y-5"},React.createElement(i,{className:"animate-fadeup overflow-hidden relative"},React.createElement("div",{className:"absolute -right-20 -top-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl"}),React.createElement(e,{icon:"book",title:f?"\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 CassavaGuard AI":"Getting started with CassavaGuard AI",sub:f?"\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21\u0E08\u0E23\u0E34\u0E07":"Recommended workflow for real field data",right:React.createElement(t,{tone:"medium"},f?"\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08":"decision support")}),React.createElement("p",{className:"txt-soft text-sm leading-relaxed relative"},f?"\u0E1C\u0E25 AI \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E1C\u0E25\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E32\u0E01\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23 \u0E2B\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E2A\u0E14\u0E07 \u201C\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33\u201D \u0E43\u0E2B\u0E49\u0E15\u0E23\u0E27\u0E08\u0E15\u0E49\u0E19\u0E08\u0E23\u0E34\u0E07 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E36\u0E01\u0E29\u0E32\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E16\u0E2D\u0E19\u0E15\u0E49\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35":"AI output is not a laboratory confirmation. When review is required, inspect the plant, compare multiple photos and consult an expert before roguing plants or applying chemicals.")),React.createElement(i,{className:"animate-fadeup border border-brand-500/20"},React.createElement(e,{icon:"play",title:f?"\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E41\u0E1A\u0E1A\u0E40\u0E23\u0E47\u0E27\u0E43\u0E19 3 \u0E19\u0E32\u0E17\u0E35":"Three-minute quick start"}),React.createElement("div",{className:"grid md:grid-cols-3 gap-3 text-sm"},(f?[["1","\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07","\u0E40\u0E1B\u0E34\u0E14 \u201C\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07\u201D \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E30\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E15\u0E23\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48"],["2","\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E","\u0E40\u0E1B\u0E34\u0E14 \u201C\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI\u201D \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E30\u0E0A\u0E19\u0E34\u0E14\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E49\u0E27\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E JPG/PNG \u0E17\u0E35\u0E48\u0E0A\u0E31\u0E14\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 10 MB"],["3","\u0E2D\u0E48\u0E32\u0E19\u0E41\u0E25\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E1C\u0E25","\u0E14\u0E39 Confidence \u0E41\u0E25\u0E30\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E49\u0E27\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E1C\u0E25\u0E44\u0E27\u0E49\u0E43\u0E19\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34"]]:[["1","Add a field","Open Field Map and enter the real field name and coordinates so weather and satellite data match the site."],["2","Upload a photo","Open AI Diagnosis, choose the field and image type, then use a clear JPG/PNG up to 10 MB."],["3","Review and verify","Read confidence and review status, compare multiple photos, then retain the result in History."]]).map(([p,u,d])=>React.createElement("div",{key:p,className:"rounded-xl border hair p-3"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement(t,{tone:"medium"},p),React.createElement("span",{className:"txt font-semibold"},u)),React.createElement("p",{className:"txt-soft text-xs leading-relaxed mt-2"},d)))),React.createElement("p",{className:"txt-muted text-xs mt-3"},f?"\u0E2B\u0E32\u0E01\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E1A\u0E19 Render Free \u0E2B\u0E25\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 \u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E32\u0E08\u0E43\u0E0A\u0E49\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E19\u0E32\u0E17\u0E35\u0E43\u0E19\u0E01\u0E32\u0E23\u0E40\u0E23\u0E34\u0E48\u0E21\u0E17\u0E33\u0E07\u0E32\u0E19\u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E23\u0E01 \u0E43\u0E2B\u0E49\u0E23\u0E2D\u0E41\u0E25\u0E49\u0E27\u0E23\u0E35\u0E40\u0E1F\u0E23\u0E0A\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07":"On Render Free, the first request after inactivity can take about a minute. Wait and refresh once.")),React.createElement("div",{className:"grid md:grid-cols-2 xl:grid-cols-3 gap-4"},l.map(([p,u],d)=>React.createElement(i,{key:p,className:"animate-fadeup",style:{animationDelay:`${d*45}ms`}},React.createElement("div",{className:"flex items-start gap-3"},React.createElement("div",{className:"w-9 h-9 rounded-xl grad-brand text-white grid place-items-center font-bold shrink-0"},d+1),React.createElement("div",null,React.createElement("h3",{className:"txt font-semibold text-sm"},p),React.createElement("p",{className:"txt-soft text-xs leading-relaxed mt-1"},u)))))),React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"grid",title:f?"\u0E41\u0E15\u0E48\u0E25\u0E30\u0E40\u0E21\u0E19\u0E39\u0E43\u0E0A\u0E49\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23":"What each area does"}),React.createElement("div",{className:"grid md:grid-cols-2 gap-x-6 gap-y-4"},c.map(([p,u])=>React.createElement("div",{key:p,className:"flex gap-3"},React.createElement(n,{name:"check",className:"w-4 h-4 text-brand-400 shrink-0 mt-0.5"}),React.createElement("div",null,React.createElement("div",{className:"txt text-sm font-medium"},p),React.createElement("div",{className:"txt-soft text-xs leading-relaxed mt-0.5"},u)))))),React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"activity",title:f?"\u0E04\u0E27\u0E32\u0E21\u0E2B\u0E21\u0E32\u0E22\u0E02\u0E2D\u0E07\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Understanding result status"}),React.createElement("div",{className:"grid md:grid-cols-2 gap-3 text-xs leading-relaxed"},React.createElement("div",{className:"rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3"},React.createElement("div",{className:"font-semibold text-emerald-300"},f?"\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19":"Ready"),React.createElement("div",{className:"txt-soft mt-1"},f?"\u0E42\u0E21\u0E40\u0E14\u0E25\u0E42\u0E2B\u0E25\u0E14\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E41\u0E25\u0E30\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1C\u0E25\u0E44\u0E14\u0E49 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E08\u0E23\u0E34\u0E07\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07":"The model loaded and can produce results, which must still be checked against the field.")),React.createElement("div",{className:"rounded-xl border border-amber-500/25 bg-amber-500/10 p-3"},React.createElement("div",{className:"font-semibold text-amber-300"},f?"\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33 / Review only":"Review required / Review only"),React.createElement("div",{className:"txt-soft mt-1"},f?"\u0E1C\u0E25\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E44\u0E21\u0E48\u0E41\u0E19\u0E48\u0E19\u0E2D\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E42\u0E21\u0E40\u0E14\u0E25\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21 \u0E2B\u0E49\u0E32\u0E21\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E40\u0E14\u0E35\u0E22\u0E27\u0E43\u0E19\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35":"The result is uncertain or not field-validated; never use it alone to justify chemical treatment.")),React.createElement("div",{className:"rounded-xl border border-slate-500/25 bg-slate-500/10 p-3"},React.createElement("div",{className:"font-semibold txt"},f?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A":"Unsupported"),React.createElement("div",{className:"txt-soft mt-1"},f?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E15\u0E34\u0E14\u0E1B\u0E49\u0E32\u0E22\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E04\u0E33\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E02\u0E2D\u0E07\u0E04\u0E25\u0E32\u0E2A\u0E19\u0E31\u0E49\u0E19":"There is not enough labelled evidence, so the app does not invent a diagnosis for that class.")),React.createElement("div",{className:"rounded-xl border border-rose-500/25 bg-rose-500/10 p-3"},React.createElement("div",{className:"font-semibold text-rose-300"},f?"\u0E42\u0E21\u0E40\u0E14\u0E25\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21 / \u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E02\u0E31\u0E14\u0E02\u0E49\u0E2D\u0E07":"Model unavailable / Service error"),React.createElement("div",{className:"txt-soft mt-1"},f?"\u0E2D\u0E22\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E1C\u0E25\u0E40\u0E14\u0E34\u0E21\u0E41\u0E17\u0E19 \u0E43\u0E2B\u0E49\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48 \u0E40\u0E1B\u0E34\u0E14 \u201C\u0E23\u0E30\u0E1A\u0E1A & \u0E42\u0E21\u0E40\u0E14\u0E25\u201D \u0E41\u0E25\u0E30\u0E41\u0E08\u0E49\u0E07\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E2B\u0E32\u0E01\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21":"Do not substitute an old result. Retry, inspect System & Models, and notify the administrator if it persists.")))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"camera",title:f?"\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A AI":"Photos suitable for AI"}),React.createElement("ul",{className:"space-y-2 txt-soft text-sm"},(f?["\u0E16\u0E48\u0E32\u0E22\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21: \u0E43\u0E1A\u0E14\u0E49\u0E32\u0E19\u0E2B\u0E19\u0E49\u0E32 \u0E43\u0E15\u0E49\u0E43\u0E1A \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E01\u0E23\u0E30\u0E08\u0E32\u0E22","\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E08\u0E32\u0E01\u0E2D\u0E34\u0E19\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E40\u0E19\u0E47\u0E15 \u0E20\u0E32\u0E1E\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D \u0E2B\u0E23\u0E37\u0E2D\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E1F\u0E34\u0E25\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2A\u0E35","Whitefly: \u0E43\u0E2B\u0E49\u0E15\u0E31\u0E27\u0E41\u0E21\u0E25\u0E07\u0E21\u0E35\u0E02\u0E19\u0E32\u0E14\u0E21\u0E2D\u0E07\u0E40\u0E2B\u0E47\u0E19\u0E44\u0E14\u0E49\u0E41\u0E25\u0E30\u0E2D\u0E22\u0E48\u0E32\u0E25\u0E14\u0E04\u0E27\u0E32\u0E21\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E01\u0E48\u0E2D\u0E19\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14","\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E43\u0E1A\u0E40\u0E1B\u0E35\u0E22\u0E01 \u0E41\u0E2A\u0E07\u0E22\u0E49\u0E2D\u0E19 \u0E41\u0E25\u0E30\u0E40\u0E07\u0E32\u0E21\u0E37\u0E2D\u0E1A\u0E31\u0E07\u0E2D\u0E32\u0E01\u0E32\u0E23"]:["Capture multiple views: leaf front, underside and whole plant for distributed symptoms.","Do not upload internet images, screenshots or color-filtered photos.","Whitefly: insects must be visible; do not downscale before upload.","Avoid wet leaves, backlighting and hand shadows over symptoms."]).map(p=>React.createElement("li",{key:p,className:"flex gap-2"},React.createElement("span",{className:"text-brand-400"},"\u2022"),React.createElement("span",null,p))))),React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"alert",title:f?"\u0E02\u0E49\u0E2D\u0E08\u0E33\u0E01\u0E31\u0E14\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E23\u0E39\u0E49":"Important limitations"}),React.createElement("div",{className:"space-y-3 text-xs leading-relaxed"},React.createElement("div",{className:"rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-200"},f?"White Leaf Spot \u0E41\u0E25\u0E30 Whitefly \u0E40\u0E1B\u0E47\u0E19\u0E42\u0E21\u0E40\u0E14\u0E25\u0E17\u0E14\u0E25\u0E2D\u0E07\u0E41\u0E1A\u0E1A review-only \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E0A\u0E38\u0E14\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E17\u0E22\u0E2D\u0E34\u0E2A\u0E23\u0E30":"White Leaf Spot and Whitefly are review-only experimental models without an independent Thai-field holdout."),React.createElement("div",{className:"rounded-xl border hair p-3 txt-soft"},f?"CAD, SED, Mealybug, Water Stress \u0E41\u0E25\u0E30 Nutrient Deficiency \u0E22\u0E31\u0E07\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E15\u0E34\u0E14\u0E1B\u0E49\u0E32\u0E22\u0E44\u0E21\u0E48\u0E1E\u0E2D \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1C\u0E25\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E41\u0E1A\u0E1A\u0E1B\u0E25\u0E2D\u0E21":"CAD, SED, Mealybug, Water Stress and Nutrient Deficiency lack sufficient labelled data, so the app does not fabricate image diagnoses."),React.createElement("div",{className:"rounded-xl border hair p-3 txt-soft"},f?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E40\u0E1B\u0E47\u0E19\u0E1C\u0E25\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23 \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E2D\u0E32\u0E08\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32\u0E08\u0E32\u0E01\u0E40\u0E21\u0E06\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19":"Weather is provider model output, and satellite imagery can be delayed by cloud cover or revisit timing.")))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Guide=r})();(function(){let{Card:i,Icon:e,Badge:t}=window.CG.UI;function n(){let{lang:s}=window.CG.Store.useStore(),a=s==="th";return React.createElement("div",{className:"space-y-5 max-w-5xl mx-auto pb-10"},React.createElement(i,{className:"animate-fadeup bg-gradient-to-br from-brand-500/10 to-cyan2/5"},React.createElement(t,{tone:"info"},a?"\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14 9 \u0E2A\u0E34\u0E07\u0E2B\u0E32\u0E04\u0E21 2569":"Last updated 9 August 2026"),React.createElement("h2",{className:"txt text-2xl sm:text-3xl font-black mt-4"},a?"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27 \u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D":"Privacy, terms and contact"),React.createElement("p",{className:"txt-soft text-sm leading-relaxed mt-2"},a?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E17\u0E35\u0E48\u0E04\u0E27\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E\u0E2B\u0E23\u0E37\u0E2D\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07":"Important information to read before uploading photos or recording field data.")),React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},(a?[["privacy","\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27","\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07 \u0E1E\u0E34\u0E01\u0E31\u0E14 \u0E20\u0E32\u0E1E\u0E1E\u0E37\u0E0A \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E15\u0E32\u0E21\u0E17\u0E35\u0E48\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E23\u0E49\u0E2D\u0E07\u0E02\u0E2D \u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E43\u0E1A\u0E2B\u0E19\u0E49\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 \u0E1B\u0E49\u0E32\u0E22\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19 \u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07"],["database","\u0E01\u0E32\u0E23\u0E40\u0E01\u0E47\u0E1A\u0E41\u0E25\u0E30\u0E25\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25","\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E41\u0E25\u0E30 metadata \u0E16\u0E39\u0E01\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E43\u0E19\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \u0E2A\u0E48\u0E27\u0E19\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E08\u0E16\u0E39\u0E01\u0E40\u0E01\u0E47\u0E1A\u0E43\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E44\u0E1F\u0E25\u0E4C \u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E25\u0E1A\u0E1C\u0E25\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E40\u0E21\u0E19\u0E39\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34 \u0E01\u0E32\u0E23\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E08\u0E04\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E15\u0E32\u0E21\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23"],["users","\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E43\u0E19\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E0A\u0E31\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19","\u0E23\u0E30\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A Login \u0E1C\u0E39\u0E49\u0E17\u0E35\u0E48\u0E21\u0E35 URL \u0E2D\u0E32\u0E08\u0E40\u0E2B\u0E47\u0E19\u0E41\u0E25\u0E30\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E0A\u0E38\u0E14\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19 \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E04\u0E27\u0E23\u0E43\u0E2A\u0E48\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E25\u0E31\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E08\u0E19\u0E01\u0E27\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E23\u0E30\u0E1A\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49"],["alert","\u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49 AI","\u0E1C\u0E25 AI \u0E40\u0E1B\u0E47\u0E19\u0E01\u0E32\u0E23\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E32\u0E01\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23 \u0E2B\u0E49\u0E32\u0E21\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E40\u0E14\u0E35\u0E22\u0E27\u0E43\u0E19\u0E01\u0E32\u0E23\u0E16\u0E2D\u0E19\u0E15\u0E49\u0E19 \u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35 \u0E2B\u0E23\u0E37\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E2D\u0E32\u0E08\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22"],["cloud","\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E20\u0E32\u0E22\u0E19\u0E2D\u0E01","\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E21\u0E32\u0E08\u0E32\u0E01 Open-Meteo \u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E21\u0E32\u0E08\u0E32\u0E01 Sentinel-2/Earth Search \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E08\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32 \u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E0A\u0E31\u0E48\u0E27\u0E04\u0E23\u0E32\u0E27"],["mail","\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25","\u0E2B\u0E32\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E1B\u0E31\u0E0D\u0E2B\u0E32 \u0E02\u0E2D\u0E41\u0E01\u0E49\u0E44\u0E02 \u0E2B\u0E23\u0E37\u0E2D\u0E25\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21 \u0E42\u0E1B\u0E23\u0E14\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E1C\u0E48\u0E32\u0E19 Repository: github.com/norapolamarit-commits/cassavaguard-render"]]:[["privacy","Privacy","The service processes field details, coordinates, crop photos, measured soil results and prediction history to provide requested features. Do not upload faces, documents, licence plates or unrelated personal data."],["database","Storage and deletion","Predictions and metadata are stored in the database, while images may be stored as files. Delete a result and its related images from History. Backups may remain according to the provider backup cycle."],["users","Current access model","Login is not required. Anyone with the URL may access the same shared dataset, so do not enter confidential or personal information until user accounts are enabled."],["alert","AI terms","AI results are screening support, not laboratory confirmation. Never use them as the sole basis for roguing, chemical treatment or other potentially harmful action."],["cloud","External services","Weather is provided by Open-Meteo and satellite observations by Sentinel-2/Earth Search. Data can be delayed, incomplete or temporarily unavailable."],["mail","Contact","To report a problem or request further correction or deletion, contact the administrator through github.com/norapolamarit-commits/cassavaguard-render."]]).map(([o,l,c])=>React.createElement(i,{key:l,className:"animate-fadeup"},React.createElement("div",{className:"flex items-start gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center shrink-0"},React.createElement(e,{name:o})),React.createElement("div",null,React.createElement("h3",{className:"txt font-bold"},l),React.createElement("p",{className:"txt-soft text-sm leading-relaxed mt-2"},c)))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Legal=n})();(function(){let{Card:i,Badge:e,Icon:t}=window.CG.UI;function n({go:s}){let{lang:a}=window.CG.Store.useStore(),r=a==="th";return React.createElement("div",{className:"space-y-6 pb-10"},React.createElement("section",{className:"relative overflow-hidden rounded-[2rem] border hair min-h-[470px] glass animate-fadeup"},React.createElement("div",{className:"absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-cyan2/10"}),React.createElement("div",{className:"absolute -top-28 -right-16 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl"}),React.createElement("div",{className:"absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan2/15 blur-3xl"}),React.createElement("div",{className:"absolute right-[8%] top-[14%] hidden lg:grid w-60 h-60 rounded-full border border-brand-400/20 place-items-center"},React.createElement("div",{className:"absolute inset-5 rounded-full border border-cyan2/20 animate-spin",style:{animationDuration:"18s"}}),React.createElement("div",{className:"w-32 h-32 rounded-[2.5rem] grad-brand grid place-items-center text-white shadow-2xl shadow-brand-500/40 rotate-6"},React.createElement(t,{name:"leaf",className:"w-16 h-16 -rotate-6"})),React.createElement("span",{className:"absolute -left-8 top-9 glass rounded-2xl px-3 py-2 text-xs txt-soft"},"AI + Field data"),React.createElement("span",{className:"absolute -right-10 bottom-8 glass rounded-2xl px-3 py-2 text-xs text-brand-300"},r?"5 \u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01":"5 primary classes")),React.createElement("div",{className:"relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20 max-w-3xl"},React.createElement(e,{tone:"online",dot:!0},r?"\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C \xB7 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19":"System online \xB7 Ready to begin"),React.createElement("h2",{className:"txt text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mt-6"},r?"\u0E14\u0E39\u0E41\u0E25\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Protect cassava",React.createElement("br",null),React.createElement("span",{className:"grad-text"},r?"\u0E14\u0E49\u0E27\u0E22\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30 AI":"with data and AI")),React.createElement("p",{className:"txt-soft text-base sm:text-lg leading-relaxed mt-5 max-w-2xl"},r?"CassavaGuard \u0E23\u0E27\u0E21\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E08\u0E32\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E41\u0E25\u0E30\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E1E\u0E37\u0E0A\u0E43\u0E19\u0E17\u0E35\u0E48\u0E40\u0E14\u0E35\u0E22\u0E27":"CassavaGuard combines field photos, weather, terrain and satellite evidence to screen risks and monitor crop health in one place."),React.createElement("div",{className:"flex flex-col sm:flex-row gap-3 mt-8"},React.createElement("button",{onClick:()=>s("predict"),className:"grad-brand text-white rounded-2xl px-6 py-3.5 font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 hover:scale-[1.02] active:scale-[.98] transition"},React.createElement(t,{name:"brain",className:"w-5 h-5"}),r?"\u0E40\u0E23\u0E34\u0E48\u0E21\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E":"Start image analysis"),React.createElement("button",{onClick:()=>s("guide"),className:"glass rounded-2xl px-6 py-3.5 txt font-semibold flex items-center justify-center gap-2 hover:bg-white/[.07] transition"},React.createElement(t,{name:"book",className:"w-5 h-5 text-brand-300"}),r?"\u0E14\u0E39\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19":"Open user guide")),React.createElement("button",{onClick:()=>s("dashboard"),className:"txt-dim hover:txt text-sm mt-5 inline-flex items-center gap-2 transition"},r?"\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21":"Or open the overview dashboard"," ",React.createElement("span",{"aria-hidden":"true"},"\u2192")))),React.createElement("section",{className:"grid md:grid-cols-3 gap-4"},(r?[["brain","\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E\u0E14\u0E49\u0E27\u0E22 AI","\u0E08\u0E33\u0E41\u0E19\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30 5 \u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01\u0E17\u0E35\u0E48\u0E21\u0E35\u0E42\u0E21\u0E40\u0E14\u0E25\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A"],["satellite","\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E1A\u0E1A\u0E23\u0E2D\u0E1A\u0E14\u0E49\u0E32\u0E19","\u0E14\u0E39\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E20\u0E32\u0E1E\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E1A\u0E1C\u0E25\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E"],["book","\u0E21\u0E35\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E17\u0E38\u0E01\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19","\u0E41\u0E19\u0E30\u0E19\u0E33\u0E01\u0E32\u0E23\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E2D\u0E48\u0E32\u0E19 Confidence \u0E41\u0E25\u0E30\u0E15\u0E23\u0E27\u0E08\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E1C\u0E25\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08"]]:[["brain","AI image diagnosis","Diagnosis is restricted to the five model-backed primary classes."],["satellite","Whole-field context","Review weather, terrain, satellite and history alongside image evidence."],["book","Guidance at every step","Learn photo capture, confidence interpretation and field verification before acting."]]).map(([l,c,f],p)=>React.createElement(i,{key:c,hover:!0,className:"animate-fadeup relative overflow-hidden",style:{animationDelay:`${p*70}ms`}},React.createElement("div",{className:"w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-cyan2/10 text-brand-300 grid place-items-center"},React.createElement(t,{name:l})),React.createElement("h3",{className:"txt font-bold mt-4"},c),React.createElement("p",{className:"txt-soft text-sm leading-relaxed mt-2"},f)))),React.createElement("section",null,React.createElement(i,{className:"animate-fadeup"},React.createElement("h3",{className:"txt font-bold text-lg"},r?"\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E01\u0E31\u0E1A CassavaGuard":"About CassavaGuard"),React.createElement("div",{className:"txt-soft text-sm leading-relaxed mt-3 space-y-3"},r?React.createElement(React.Fragment,null,React.createElement("p",null,"CassavaGuard \u0E40\u0E1B\u0E47\u0E19\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E1A\u0E19\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E21\u0E37\u0E2D\u0E16\u0E37\u0E2D\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E1B\u0E31\u0E0D\u0E0D\u0E32\u0E1B\u0E23\u0E30\u0E14\u0E34\u0E29\u0E10\u0E4C (AI) \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E1C\u0E39\u0E49\u0E1B\u0E25\u0E39\u0E01\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07\u0E43\u0E19\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E0A\u0E41\u0E25\u0E30\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07\u0E42\u0E23\u0E04\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19 \u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E02\u0E36\u0E49\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E01\u0E49\u0E44\u0E02\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07 \u0E40\u0E0A\u0E48\u0E19 \u0E01\u0E32\u0E23\u0E23\u0E30\u0E1A\u0E32\u0E14\u0E02\u0E2D\u0E07\u0E42\u0E23\u0E04 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E1E\u0E36\u0E48\u0E07\u0E1E\u0E32\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E07\u0E40\u0E01\u0E15\u0E14\u0E49\u0E27\u0E22\u0E2A\u0E32\u0E22\u0E15\u0E32\u0E02\u0E2D\u0E07\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27 \u0E0B\u0E36\u0E48\u0E07\u0E2D\u0E32\u0E08\u0E17\u0E33\u0E43\u0E2B\u0E49\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E1E\u0E37\u0E0A\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33"),React.createElement("p",null,"\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E\u0E43\u0E1A\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E1A\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38\u0E2A\u0E20\u0E32\u0E1E\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E0A\u0E43\u0E19\u0E01\u0E25\u0E38\u0E48\u0E21\u0E42\u0E23\u0E04\u0E2B\u0E25\u0E31\u0E01 \u0E44\u0E14\u0E49\u0E41\u0E01\u0E48 Healthy, CBB, CBSD, CMD \u0E41\u0E25\u0E30 CGM \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E2A\u0E14\u0E07\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08 \u0E04\u0E27\u0E32\u0E21\u0E23\u0E38\u0E19\u0E41\u0E23\u0E07 Heatmap \u0E41\u0E25\u0E30\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E17\u0E35\u0E48\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E41\u0E1B\u0E25\u0E07"),React.createElement("p",null,"\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E19\u0E35\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E43\u0E2B\u0E49\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E23\u0E27\u0E14\u0E40\u0E23\u0E47\u0E27 \u0E2A\u0E30\u0E14\u0E27\u0E01 \u0E41\u0E25\u0E30\u0E43\u0E0A\u0E49\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E01\u0E32\u0E23\u0E40\u0E01\u0E29\u0E15\u0E23\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33 \u0E25\u0E14\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E0D\u0E40\u0E2A\u0E35\u0E22\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A\u0E42\u0E23\u0E04\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32 \u0E41\u0E25\u0E30\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E14\u0E49\u0E17\u0E31\u0E19\u0E17\u0E48\u0E27\u0E07\u0E17\u0E35\u0E21\u0E32\u0E01\u0E02\u0E36\u0E49\u0E19 \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E20\u0E32\u0E27\u0E30\u0E02\u0E32\u0E14\u0E18\u0E32\u0E15\u0E38\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E34\u0E28\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E15\u0E48\u0E2D\u0E44\u0E1B\u0E02\u0E2D\u0E07\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23 \u0E0B\u0E36\u0E48\u0E07\u0E08\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1D\u0E36\u0E01\u0E42\u0E21\u0E40\u0E14\u0E25\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E48\u0E32\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E16\u0E37\u0E2D"),React.createElement("p",null,"\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E31\u0E49\u0E19\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E19\u0E33\u0E44\u0E1B\u0E43\u0E0A\u0E49\u0E43\u0E19\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E40\u0E01\u0E29\u0E15\u0E23\u0E42\u0E14\u0E22\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 \u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E36\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E1C\u0E25\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E41\u0E17\u0E19\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E44\u0E14\u0E49")):React.createElement(React.Fragment,null,React.createElement("p",null,"CassavaGuard is a mobile application that uses artificial intelligence (AI) to help cassava farmers monitor plant health and screen for disease early. The project was built to address problems in cassava production such as disease outbreaks and reliance on visual inspection alone, which can delay or reduce the accuracy of crop management decisions."),React.createElement("p",null,"The application analyzes cassava leaf photos with weather, terrain and satellite evidence to identify the primary classes \u2014 Healthy, CBB, CBSD, CMD and CGM \u2014 and provides confidence, severity, a heatmap and field-grounded guidance."),React.createElement("p",null,"The application gives farmers fast, convenient information to support decision-making, enabling precision agriculture, reducing losses from delayed disease detection, and allowing more timely field management. Nutrient-deficiency assessment and yield forecasting are future directions for the project, to be enabled once enough real data exists to train those models reliably."),React.createElement("p",null,"The system is currently at the stage of an early screening assistant and still requires formal field validation before its output can be used to automate agricultural decisions. Results from the system are decision-support information, not a confirmed diagnosis that replaces an expert."))))),React.createElement("section",{className:"grid lg:grid-cols-[1.2fr_.8fr] gap-4"},React.createElement(i,{className:"animate-fadeup"},React.createElement("div",{className:"flex flex-col sm:flex-row sm:items-center gap-4"},React.createElement("div",{className:"w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 grid place-items-center shrink-0"},React.createElement(t,{name:"alert"})),React.createElement("div",{className:"flex-1"},React.createElement("h3",{className:"txt font-semibold"},r?"AI \u0E0A\u0E48\u0E27\u0E22\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E1C\u0E25\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E32\u0E01\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23":"AI screening is not laboratory confirmation"),React.createElement("p",{className:"txt-soft text-xs leading-relaxed mt-1"},r?"\u0E15\u0E23\u0E27\u0E08\u0E15\u0E49\u0E19\u0E08\u0E23\u0E34\u0E07 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E36\u0E01\u0E29\u0E32\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E16\u0E2D\u0E19\u0E15\u0E49\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35":"Inspect plants, compare multiple photos and consult an expert before roguing or chemical treatment.")),React.createElement("button",{onClick:()=>s("system"),className:"rounded-xl border hair px-4 py-2 txt-soft hover:txt text-xs font-semibold transition"},r?"\u0E14\u0E39\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E42\u0E21\u0E40\u0E14\u0E25":"Model status"))),React.createElement(i,{className:"animate-fadeup bg-gradient-to-br from-brand-500/10 to-cyan2/5"},React.createElement("div",{className:"flex items-center justify-between gap-4 h-full"},React.createElement("div",null,React.createElement("div",{className:"txt-dim text-xs"},r?"\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E23\u0E01":"Recommended first step"),React.createElement("div",{className:"txt font-bold mt-1"},r?"\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E41\u0E1B\u0E25\u0E07\u0E14\u0E49\u0E27\u0E22\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07":"Create a field with real coordinates")),React.createElement("button",{onClick:()=>s("map"),className:"w-11 h-11 rounded-xl grad-brand text-white grid place-items-center hover:scale-105 transition"},React.createElement(t,{name:"map"}))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Welcome=n})();(function(){let{useState:i,useEffect:e,useCallback:t}=React,{Icon:n,ToastHost:s,Modal:a}=window.CG.UI,r=window.CG.Pages,o=[{key:"predict",icon:"camera",th:"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",en:"Analyze"},{key:"history",icon:"history",th:"\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34",en:"History"},{key:"recommendations",icon:"bulb",th:"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",en:"Advice"},{key:"weather",icon:"cloud",th:"\u0E2D\u0E32\u0E01\u0E32\u0E28",en:"Weather"}],l=[{key:"map",icon:"map",th:"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07",en:"Field map"},{key:"satellite",icon:"satellite",th:"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite"},{key:"dashboard",icon:"grid",th:"\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",en:"Overview"},{key:"system",icon:"cpu",th:"\u0E2A\u0E16\u0E32\u0E19\u0E30 AI",en:"AI status"},{key:"guide",icon:"book",th:"\u0E27\u0E34\u0E18\u0E35\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",en:"How to use"},{key:"legal",icon:"privacy",th:"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27",en:"Privacy"}];function c(){let{lang:d,theme:x,toggleTheme:M,toggleLang:m,user:h,booted:S}=window.CG.Store.useStore(),[E,y]=i("predict"),[g,_]=i(null),[R,v]=i(!1),T=w=>d==="th"?w.th:w.en,C=t((w,D=null)=>{y(w),_(D),v(!1),window.scrollTo({top:0,behavior:"smooth"})},[]);if(e(()=>{h&&window.CG.API_CLIENT.classes().then(w=>{window.CG._classMap={},w.forEach(D=>{window.CG._classMap[D.key]=D})}).catch(()=>{})},[h]),!S)return React.createElement("div",{className:"min-h-screen theme-bg grid place-items-center"},React.createElement("div",{className:"brand-orbit"},React.createElement(n,{name:"leaf",className:"w-7 h-7"})));if(!h)return React.createElement("div",{className:"min-h-screen theme-bg grid place-items-center px-6 text-center"},React.createElement("div",null,React.createElement("div",{className:"txt text-xl font-bold"},"CassavaGuard AI"),React.createElement("p",{className:"txt-soft mt-2"},d==="th"?"\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D API \u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E27\u0E48\u0E32 backend \u0E01\u0E33\u0E25\u0E31\u0E07\u0E17\u0E33\u0E07\u0E32\u0E19":"Unable to connect to the API. Check that the backend is running.")));let N=()=>{switch(E){case"predict":return React.createElement(r.Predict,null);case"history":return React.createElement(r.History,null);case"recommendations":return React.createElement(r.Recommendations,{initialField:g});case"weather":return React.createElement(r.Weather,{initialField:g});case"map":return React.createElement(r.FieldMap,{go:C});case"satellite":return React.createElement(r.Satellite,{initialField:g});case"dashboard":return React.createElement(r.Dashboard,{go:C});case"system":return React.createElement(r.System,null);case"guide":return React.createElement(r.Guide,null);case"legal":return React.createElement(r.Legal,null);default:return React.createElement(r.Predict,null)}},L=[...o,...l].find(w=>w.key===E),O={history:{th:"\u0E22\u0E49\u0E2D\u0E19\u0E14\u0E39\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E41\u0E25\u0E30\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07",en:"Review analyses and track changes over time"},recommendations:{th:"\u0E41\u0E19\u0E27\u0E17\u0E32\u0E07\u0E14\u0E39\u0E41\u0E25\u0E17\u0E35\u0E48\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E01\u0E31\u0E1A\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14",en:"Care guidance linked to your latest results"},weather:{th:"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07",en:"Live weather context for field planning"},map:{th:"\u0E14\u0E39\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E41\u0E25\u0E30\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E02\u0E2D\u0E07\u0E41\u0E15\u0E48\u0E25\u0E30\u0E41\u0E1B\u0E25\u0E07",en:"View the location and status of every field"},satellite:{th:"\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E04\u0E27\u0E32\u0E21\u0E40\u0E02\u0E35\u0E22\u0E27\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E08\u0E32\u0E01\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Track vegetation and change from satellite data"},dashboard:{th:"\u0E2A\u0E23\u0E38\u0E1B\u0E2A\u0E34\u0E48\u0E07\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E08\u0E32\u0E01\u0E17\u0E38\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E14\u0E35\u0E22\u0E27",en:"The important signals across all fields"},system:{th:"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E42\u0E21\u0E40\u0E14\u0E25 \u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E02\u0E2D\u0E07\u0E23\u0E30\u0E1A\u0E1A",en:"Model quality, evidence, and system readiness"},guide:{th:"\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E41\u0E25\u0E30\u0E2D\u0E48\u0E32\u0E19\u0E1C\u0E25\u0E43\u0E2B\u0E49\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07",en:"Capture better photos and understand results"},legal:{th:"\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \u0E02\u0E49\u0E2D\u0E08\u0E33\u0E01\u0E31\u0E14 \u0E41\u0E25\u0E30\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D",en:"Data use, limitations, and contact information"}};return React.createElement("div",{className:"min-h-screen theme-bg pb-24 md:pb-0"},React.createElement("a",{href:"#main-content",className:"skip-link"},d==="th"?"\u0E02\u0E49\u0E32\u0E21\u0E44\u0E1B\u0E22\u0E31\u0E07\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E2B\u0E25\u0E31\u0E01":"Skip to main content"),React.createElement("header",{className:"sticky top-0 z-[800] app-header"},React.createElement("div",{className:"max-w-7xl mx-auto h-[72px] px-4 sm:px-6 flex items-center gap-4"},React.createElement("button",{onClick:()=>C("predict"),className:"flex items-center gap-3 shrink-0","aria-label":"CassavaGuard"},React.createElement("span",{className:"brand-mark"},React.createElement(n,{name:"leaf",className:"w-6 h-6"})),React.createElement("span",{className:"hidden sm:block text-left"},React.createElement("span",{className:"txt block font-extrabold text-base leading-none"},"CassavaGuard"),React.createElement("span",{className:"brand-copy block mt-1"},"AI \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07"))),React.createElement("nav",{className:"hidden md:flex items-center justify-center gap-1 ml-auto","aria-label":d==="th"?"\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E25\u0E31\u0E01":"Main navigation"},o.map(w=>React.createElement(f,{key:w.key,item:w,active:E===w.key,text:T(w),onClick:()=>C(w.key)})),React.createElement("button",{onClick:()=>v(!0),className:"nav-pill txt-soft"},React.createElement(n,{name:"grid",className:"w-4 h-4"}),d==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21":"More")),React.createElement("div",{className:"flex items-center gap-2 md:ml-3 ml-auto"},React.createElement("button",{onClick:m,className:"utility-button","aria-label":d==="th"?"\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E29\u0E32\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29":"Switch to Thai"},d==="th"?"EN":"\u0E44\u0E17\u0E22"),React.createElement("button",{onClick:M,className:"utility-button square","aria-label":d==="th"?"\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E18\u0E35\u0E21":"Change theme"},React.createElement(n,{name:x==="dark"?"sun":"moon",className:"w-4 h-4"})),React.createElement("button",{onClick:()=>v(!0),className:"utility-button square md:hidden","aria-label":d==="th"?"\u0E40\u0E1B\u0E34\u0E14\u0E40\u0E21\u0E19\u0E39":"Open menu"},React.createElement(n,{name:"menu",className:"w-5 h-5"}))))),E!=="predict"&&React.createElement("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 pt-7"},React.createElement("div",{className:"route-heading"},React.createElement("span",{className:"page-icon"},React.createElement(n,{name:L?.icon||"leaf",className:"w-5 h-5"})),React.createElement("div",null,React.createElement("h1",{className:"txt text-2xl sm:text-3xl font-extrabold"},L?T(L):"CassavaGuard"),O[E]&&React.createElement("p",{className:"txt-soft text-sm mt-1"},d==="th"?O[E].th:O[E].en)))),React.createElement("main",{id:"main-content",tabIndex:"-1",className:"max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-7"},React.createElement("div",{key:E,className:"page-enter"},N())),React.createElement("nav",{className:"mobile-dock md:hidden","aria-label":d==="th"?"\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E25\u0E31\u0E01":"Main navigation"},o.slice(0,3).map(w=>React.createElement(p,{key:w.key,item:w,active:E===w.key,text:T(w),onClick:()=>C(w.key)})),React.createElement(p,{item:{icon:"menu"},active:l.some(w=>w.key===E)||E==="weather",text:d==="th"?"\u0E40\u0E21\u0E19\u0E39":"Menu",onClick:()=>v(!0)})),React.createElement(a,{open:R,onClose:()=>v(!1),title:d==="th"?"\u0E40\u0E21\u0E19\u0E39\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14":"All features"},React.createElement("div",{className:"grid grid-cols-2 gap-3"},[...o,...l].map(w=>React.createElement("button",{key:w.key,onClick:()=>C(w.key),className:`menu-tile ${E===w.key?"active":""}`},React.createElement("span",{className:"menu-tile-icon"},React.createElement(n,{name:w.icon,className:"w-5 h-5"})),React.createElement("span",null,T(w)))))),React.createElement(u,{lang:d}),React.createElement(s,null))}function f({item:d,active:x,text:M,onClick:m}){return React.createElement("button",{onClick:m,className:`nav-pill ${x?"active":"txt-soft"}`},React.createElement(n,{name:d.icon,className:"w-4 h-4"}),M)}function p({item:d,active:x,text:M,onClick:m}){return React.createElement("button",{onClick:m,className:`dock-item ${x?"active":""}`},React.createElement(n,{name:d.icon,className:"w-5 h-5"}),React.createElement("span",null,M))}function u({lang:d}){let[x,M]=i(!1),[m,h]=i(""),[S,E]=i(!1),[y,g]=i([{role:"assistant",text:d==="th"?"\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35\u0E04\u0E23\u0E31\u0E1A \u0E1C\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E2D\u0E18\u0E34\u0E1A\u0E32\u0E22\u0E1C\u0E25\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14\u0E41\u0E25\u0E30\u0E41\u0E19\u0E30\u0E19\u0E33\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E14\u0E39\u0E41\u0E25\u0E44\u0E14\u0E49":"Hello. I can explain your latest result and suggest next care steps."}]),_=async R=>{let v=(R||m).trim();if(!(!v||S)){g(T=>[...T,{role:"user",text:v}]),h(""),E(!0);try{let T=await window.CG.API_CLIENT.chat(v,d);g(C=>[...C,{role:"assistant",text:T.reply,quick:T.quick_replies}])}catch(T){g(C=>[...C,{role:"assistant",text:T.message||(d==="th"?"\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49":"Assistant unavailable")}])}finally{E(!1)}}};return React.createElement("div",{className:`advice-chat ${x?"open":""}`},x&&React.createElement("section",{className:"advice-chat-panel","aria-label":d==="th"?"\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E41\u0E19\u0E30\u0E19\u0E33":"Advice assistant"},React.createElement("header",null,React.createElement("div",null,React.createElement("b",null,d==="th"?"\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22 CassavaGuard":"CassavaGuard Assistant"),React.createElement("span",null,d==="th"?"\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Grounded in your latest result")),React.createElement("button",{onClick:()=>M(!1),"aria-label":"Close"},React.createElement(n,{name:"close",className:"w-5 h-5"}))),React.createElement("div",{className:"advice-chat-messages"},y.map((R,v)=>React.createElement("div",{key:v,className:`chat-message ${R.role}`},React.createElement("p",null,R.text),R.quick&&React.createElement("div",{className:"chat-quick"},R.quick.map(T=>React.createElement("button",{key:T,onClick:()=>_(T)},T))))),S&&React.createElement("div",{className:"chat-message assistant"},React.createElement(Spinner,{className:"w-4 h-4"}))),React.createElement("form",{onSubmit:R=>{R.preventDefault(),_()}},React.createElement("input",{maxLength:"500",value:m,onChange:R=>h(R.target.value),placeholder:d==="th"?"\u0E16\u0E32\u0E21\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E1C\u0E25 \u0E42\u0E23\u0E04 \u0E19\u0E49\u0E33 \u0E1B\u0E38\u0E4B\u0E22 \u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u2026":"Ask about results, disease, water, fertilizer\u2026"}),React.createElement("button",{disabled:S||!m.trim()},React.createElement(n,{name:"play",className:"w-4 h-4"}))),React.createElement("small",null,d==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E41\u0E17\u0E19\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E25\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23":"Screening guidance; not a substitute for expert or laboratory confirmation.")),React.createElement("button",{className:"advice-chat-fab",onClick:()=>M(R=>!R),"aria-label":d==="th"?"\u0E40\u0E1B\u0E34\u0E14\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E41\u0E19\u0E30\u0E19\u0E33":"Open advice assistant"},React.createElement(n,{name:x?"close":"bulb",className:"w-6 h-6"}),React.createElement("span",null,d==="th"?"\u0E16\u0E32\u0E21\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22":"Ask")))}window.CG.App=c})();(function(){ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(window.CG.Store.Provider,null,React.createElement(window.CG.App)))})();})();
