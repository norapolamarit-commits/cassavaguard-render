(()=>{window.CG={API:""};(function(){let i="cg_token";function e(){return localStorage.getItem(i)||""}function t(a){a?localStorage.setItem(i,a):localStorage.removeItem(i)}async function n(a,{method:r="GET",body:o,form:l,auth:c=!0,raw:u=!1}={}){let p={};c&&e()&&(p.Authorization="Bearer "+e());let f;l?f=l:o!==void 0&&(p["Content-Type"]="application/json",f=JSON.stringify(o));let h=await fetch(window.CG.API+a,{method:r,headers:p,body:f});if(u)return c&&h.status===401&&(t(""),window.dispatchEvent(new Event("cg:unauthorized"))),h;let T=(h.headers.get("content-type")||"").includes("application/json")?await h.json():await h.text();if(!h.ok){c&&h.status===401&&(t(""),window.dispatchEvent(new Event("cg:unauthorized")));let m=T&&T.detail?T.detail:typeof T=="string"?T:"Request failed",d=new Error(m);throw d.status=h.status,d.data=T,d}return T}let s={getToken:e,setToken:t,get:a=>n(a),post:(a,r)=>n(a,{method:"POST",body:r}),patch:(a,r)=>n(a,{method:"PATCH",body:r}),delete:a=>n(a,{method:"DELETE"}),postForm:(a,r)=>n(a,{method:"POST",form:r}),raw:(a,r)=>n(a,{...r,raw:!0}),health:()=>n("/api/health",{auth:!1}),login:(a,r)=>n("/api/auth/login-json",{method:"POST",body:{email:a,password:r},auth:!1}),register:a=>n("/api/auth/register",{method:"POST",body:a,auth:!1}),forgot:a=>n("/api/auth/forgot",{method:"POST",body:{email:a},auth:!1}),reset:(a,r)=>n("/api/auth/reset",{method:"POST",body:{token:a,new_password:r},auth:!1}),me:()=>n("/api/auth/me"),updateMe:a=>n("/api/auth/me",{method:"PATCH",body:a}),adminUsers:()=>n("/api/admin/users"),updateUserRole:(a,r)=>n(`/api/admin/users/${a}/role`,{method:"PATCH",body:{role:r}}),kpis:()=>n("/api/dashboard/kpis"),riskDist:()=>n("/api/dashboard/risk-distribution"),healthByField:()=>n("/api/dashboard/health-by-field"),fields:()=>n("/api/fields"),fieldsGeo:()=>n("/api/fields/geojson"),field:a=>n("/api/fields/"+a),createField:a=>n("/api/fields",{method:"POST",body:a}),chat:(a,r="th")=>n("/api/chat",{method:"POST",body:{message:a,language:r}}),predictImage:(a,r,o,l,c)=>{let u=new FormData;return u.append("file",a),u.append("source",r),o&&u.append("field_id",o),l&&u.append("client_observed_at",l),c&&u.append("client_timestamp_kind",c),n("/api/predict/image",{method:"POST",form:u})},predictImages:(a,r,o,l)=>{let c=new FormData;return a.forEach(u=>{c.append("files",u.file),c.append("sources",u.source)}),r&&c.append("field_id",r),o&&c.append("client_observed_at",o),l&&c.append("client_timestamp_kind",l),n("/api/predict/images",{method:"POST",form:c})},predictCsv:(a,r)=>{let o=new FormData;return o.append("file",a),r&&o.append("field_id",r),n("/api/predict/csv",{method:"POST",form:o})},classes:()=>n("/api/predict/classes"),predictionContext:a=>n(`/api/predict/context/${a}`),yieldEstimate:a=>n("/api/predict/yield-estimate",{method:"POST",body:a}),rootWeight:a=>n("/api/predict/root-weight",{method:"POST",body:a}),rootSize:(a,r="side")=>{let o=new FormData;return o.append("file",a),o.append("view",r),n("/api/predict/root-size",{method:"POST",form:o})},saveRootImageSet:a=>{let r=new FormData;return a.forEach(o=>r.append("files",o)),n("/api/predict/root-image-sets",{method:"POST",form:r})},saveRootVideoSet:a=>{let r=new FormData;return r.append("file",a),n("/api/predict/root-video-sets",{method:"POST",form:r})},startRootReconstruction:a=>n("/api/predict/reconstruction",{method:"POST",body:a}),rootReconstructionStatus:a=>n(`/api/predict/reconstruction/${a}`),saveHarvestMeasurement:a=>n("/api/predict/harvest-measurements",{method:"POST",body:a}),satMeta:()=>n("/api/satellite/meta"),satTimeline:(a,r=12)=>n(`/api/satellite/${a}/timeline?months=${r}`),satGrid:(a,r,o)=>n(`/api/satellite/${a}/grid?index=${r}`+(o?`&date=${o}`:"")),satPasses:a=>n(`/api/satellite/${a}/passes`),satCompare:(a,r,o,l)=>n(`/api/satellite/${a}/compare?index=${encodeURIComponent(r)}`+(o?`&date_a=${encodeURIComponent(o)}`:"")+(l?`&date_b=${encodeURIComponent(l)}`:"")),weatherCurrent:a=>n("/api/weather/current"+(a?`?field_id=${a}`:"")),weatherHistory:(a,r=30)=>n(`/api/weather/history?days=${r}`+(a?`&field_id=${a}`:"")),weatherForecast:(a,r=7)=>n(`/api/weather/forecast?days=${r}`+(a?`&field_id=${a}`:"")),weatherSummary:a=>n("/api/weather/summary"+(a?`?field_id=${a}`:"")),soil:a=>n("/api/soil/"+a),soilMoisture:(a,r=30)=>n(`/api/soil/${a}/moisture?days=${r}`),soilAll:()=>n("/api/soil"),soilSamples:a=>n(`/api/soil/${a}/samples`),createSoilSample:(a,r)=>n(`/api/soil/${a}/samples`,{method:"POST",body:r}),notifications:a=>n("/api/notifications"+(a?"?unread_only=true":"")),markRead:a=>n(`/api/notifications/${a}/read`,{method:"POST"}),markAllRead:()=>n("/api/notifications/read-all",{method:"POST"}),history:(a={})=>{let r=new URLSearchParams(a).toString();return n("/api/history/predictions"+(r?"?"+r:""))},historyDetail:a=>n("/api/history/predictions/"+a),deletePrediction:a=>n("/api/history/predictions/"+a,{method:"DELETE"}),exportCsv:()=>n("/api/history/predictions/export.csv",{raw:!0}),models:()=>n("/api/models"),modelCompare:()=>n("/api/models/compare"),systemStatus:()=>n("/api/models/system"),logs:()=>n("/api/logs")};window.CG.API_CLIENT=s})();(function(){let i={app_name:{th:"CassavaGuard AI",en:"CassavaGuard AI"},app_tag:{th:"\u0E41\u0E1E\u0E25\u0E15\u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E40\u0E01\u0E29\u0E15\u0E23\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33\u0E14\u0E49\u0E27\u0E22 AI",en:"AI Precision Agriculture"},nav_dashboard:{th:"\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14",en:"Dashboard"},nav_map:{th:"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07",en:"Field Map"},nav_predict:{th:"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI",en:"AI Diagnosis"},nav_satellite:{th:"\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite"},nav_weather:{th:"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28",en:"Weather"},nav_soil:{th:"\u0E14\u0E34\u0E19",en:"Soil"},nav_reco:{th:"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",en:"Recommendations"},nav_history:{th:"\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34",en:"History"},nav_system:{th:"\u0E23\u0E30\u0E1A\u0E1A & \u0E42\u0E21\u0E40\u0E14\u0E25",en:"System & Models"},nav_guide:{th:"\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",en:"User Guide"},nav_legal:{th:"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27 & \u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D",en:"Privacy & Contact"},nav_welcome:{th:"\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19",en:"Welcome"},nav_more:{th:"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21",en:"More"},loading:{th:"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14\u2026",en:"Loading\u2026"},healthy:{th:"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E14\u0E35",en:"Healthy"},high_risk:{th:"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07",en:"High Risk"},medium:{th:"\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",en:"Medium"},low:{th:"\u0E15\u0E48\u0E33",en:"Low"},high:{th:"\u0E2A\u0E39\u0E07",en:"High"},optimal:{th:"\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E2A\u0E21",en:"Optimal"},warning:{th:"\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07",en:"Warning"},critical:{th:"\u0E27\u0E34\u0E01\u0E24\u0E15",en:"Critical"},confidence:{th:"\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08",en:"Confidence"},evidence:{th:"\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19",en:"Evidence"},recommendation:{th:"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",en:"Recommendation"},view:{th:"\u0E14\u0E39",en:"View"},close:{th:"\u0E1B\u0E34\u0E14",en:"Close"},all_fields:{th:"\u0E17\u0E38\u0E01\u0E41\u0E1B\u0E25\u0E07",en:"All fields"},select_field:{th:"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07",en:"Select field"},logout:{th:"\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",en:"Log out"},search:{th:"\u0E04\u0E49\u0E19\u0E2B\u0E32",en:"Search"},export_csv:{th:"\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 CSV",en:"Export CSV"},export_pdf:{th:"\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 PDF",en:"Export PDF"},no_data:{th:"\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",en:"No data"},rai:{th:"\u0E44\u0E23\u0E48",en:"rai"},days:{th:"\u0E27\u0E31\u0E19",en:"days"},age:{th:"\u0E2D\u0E32\u0E22\u0E38",en:"Age"},variety:{th:"\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C",en:"Variety"},dash_title:{th:"\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E23\u0E30\u0E1A\u0E1A",en:"Operations Overview"},dash_sub:{th:"\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E23\u0E27\u0E21\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07",en:"Integrated cassava monitoring center"},kpi_fields:{th:"\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21",en:"Monitored Fields"},kpi_plants:{th:"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2F",en:"Cassava Plants"},kpi_healthy:{th:"\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E14\u0E35",en:"Healthy Rate"},kpi_risk:{th:"\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07",en:"High-Risk Rate"},kpi_disease:{th:"\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E42\u0E23\u0E04",en:"Disease Alerts"},kpi_nutrient:{th:"\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E18\u0E32\u0E15\u0E38\u0E2D\u0E32\u0E2B\u0E32\u0E23",en:"Nutrient Alerts"},kpi_water:{th:"\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E19\u0E49\u0E33",en:"Water Alerts"},kpi_health:{th:"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22",en:"Avg Health"},weather_now:{th:"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19",en:"Weather Now"},sat_status:{th:"\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite Status"},risk_dist:{th:"\u0E01\u0E32\u0E23\u0E01\u0E23\u0E30\u0E08\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07",en:"Risk Distribution"},field_health:{th:"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E23\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07",en:"Health by Field"},online:{th:"\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C",en:"online"},predict_title:{th:"\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E1E\u0E37\u0E0A\u0E14\u0E49\u0E27\u0E22 AI",en:"AI Crop Diagnosis"},predict_sub:{th:"\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E\u0E43\u0E1A / \u0E15\u0E49\u0E19 / \u0E17\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E21 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E1F\u0E25\u0E4C CSV \u0E40\u0E0B\u0E19\u0E40\u0E0B\u0E2D\u0E23\u0E4C",en:"Upload leaf / plant / canopy image or sensor CSV"},drop_here:{th:"\u0E25\u0E32\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E21\u0E32\u0E27\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01",en:"Drop file here or click to browse"},analyze:{th:"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",en:"Analyze"},analyzing:{th:"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22\u0E42\u0E21\u0E40\u0E14\u0E25\u2026",en:"Running inference\u2026"},top3:{th:"3 \u0E2D\u0E31\u0E19\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19",en:"Top 3 Predictions"},symptoms:{th:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A",en:"Detected Symptoms"},attention:{th:"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E08\u0E38\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D (Attribution Map)",en:"AI Attribution Map"},explain:{th:"\u0E04\u0E33\u0E2D\u0E18\u0E34\u0E1A\u0E32\u0E22\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",en:"AI Explanation"},feat_imp:{th:"\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E02\u0E2D\u0E07\u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22",en:"Feature Importance"},prob_dist:{th:"\u0E01\u0E32\u0E23\u0E01\u0E23\u0E30\u0E08\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19",en:"Probability Distribution"},src_leaf:{th:"\u0E43\u0E1A",en:"Leaf"},src_plant:{th:"\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19",en:"Plant"},src_canopy:{th:"\u0E17\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E21",en:"Canopy"},src_csv:{th:"CSV",en:"CSV"},take_photo:{th:"\u0E16\u0E48\u0E32\u0E22\u0E23\u0E39\u0E1B",en:"Take Photo"},upload_file:{th:"\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C",en:"Upload File"},capture:{th:"\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E",en:"Capture"},retake:{th:"\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48",en:"Retake"},use_photo:{th:"\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E19\u0E35\u0E49",en:"Use Photo"},switch_cam:{th:"\u0E2A\u0E25\u0E31\u0E1A\u0E01\u0E25\u0E49\u0E2D\u0E07",en:"Flip Camera"},cam_error:{th:"\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E01\u0E25\u0E49\u0E2D\u0E07\u0E44\u0E14\u0E49 \u2014 \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",en:"Cannot access camera \u2014 check permissions"},cam_starting:{th:"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E1B\u0E34\u0E14\u0E01\u0E25\u0E49\u0E2D\u0E07\u2026",en:"Starting camera\u2026"},login:{th:"\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A",en:"Log in"},register:{th:"\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01",en:"Register"},email:{th:"\u0E2D\u0E35\u0E40\u0E21\u0E25",en:"Email"},password:{th:"\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19",en:"Password"},full_name:{th:"\u0E0A\u0E37\u0E48\u0E2D-\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25",en:"Full name"},role:{th:"\u0E1A\u0E17\u0E1A\u0E32\u0E17",en:"Role"},forgot_pw:{th:"\u0E25\u0E37\u0E21\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19?",en:"Forgot password?"},have_account:{th:"\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27?",en:"Already have an account?"},no_account:{th:"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35?",en:"Don't have an account?"},admin:{th:"\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A",en:"Admin"},researcher:{th:"\u0E19\u0E31\u0E01\u0E27\u0E34\u0E08\u0E31\u0E22",en:"Researcher"},farmer:{th:"\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23",en:"Farmer"},demo_accounts:{th:"\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E17\u0E14\u0E25\u0E2D\u0E07",en:"Demo accounts"},notifications:{th:"\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19",en:"Notifications"},mark_all_read:{th:"\u0E2D\u0E48\u0E32\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",en:"Mark all read"},veg_indices:{th:"\u0E14\u0E31\u0E0A\u0E19\u0E35\u0E1E\u0E37\u0E0A\u0E1E\u0E23\u0E23\u0E13",en:"Vegetation Indices"},time_slider:{th:"\u0E44\u0E17\u0E21\u0E4C\u0E2A\u0E44\u0E25\u0E40\u0E14\u0E2D\u0E23\u0E4C",en:"Time Slider"},risk_zones:{th:"\u0E42\u0E0B\u0E19\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07",en:"Risk Zones"},sat_timeline:{th:"\u0E44\u0E17\u0E21\u0E4C\u0E44\u0E25\u0E19\u0E4C\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite Pass Timeline"},compare:{th:"\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32",en:"Historical Comparison"},forecast:{th:"\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E13\u0E4C 7 \u0E27\u0E31\u0E19",en:"7-Day Forecast"},trend:{th:"\u0E41\u0E19\u0E27\u0E42\u0E19\u0E49\u0E21\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07",en:"Historical Trend"},soil_profile:{th:"\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C\u0E14\u0E34\u0E19",en:"Soil Profile"},moisture:{th:"\u0E04\u0E27\u0E32\u0E21\u0E0A\u0E37\u0E49\u0E19\u0E14\u0E34\u0E19",en:"Soil Moisture"},model_perf:{th:"\u0E2A\u0E21\u0E23\u0E23\u0E16\u0E19\u0E30\u0E42\u0E21\u0E40\u0E14\u0E25",en:"Model Performance"},model_cmp:{th:"\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E42\u0E21\u0E40\u0E14\u0E25",en:"Model Comparison"},server_status:{th:"\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C",en:"Server Status"},training_logs:{th:"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E23\u0E30\u0E1A\u0E1A",en:"System Logs"}};function e(t){return n=>i[n]?i[n][t]||i[n].en:n}window.CG.DICT=i,window.CG.makeT=e})();(function(){let{createContext:i,useContext:e,useState:t,useEffect:n,useCallback:s,useRef:a}=React,r=i(null);function o({children:l}){let[c,u]=t(()=>localStorage.getItem("cg_theme")||"dark"),[p,f]=t(()=>localStorage.getItem("cg_lang")||"en"),[h,g]=t(null),[T,m]=t(!1),[d,w]=t([]),C=a(1);n(()=>{let x=document.documentElement;x.classList.toggle("dark",c==="dark"),x.classList.toggle("light",c==="light"),localStorage.setItem("cg_theme",c)},[c]),n(()=>{localStorage.setItem("cg_lang",p),document.documentElement.lang=p},[p]),n(()=>{let x=window.CG.API_CLIENT;x.setToken(""),x.me().then(g).finally(()=>m(!0))},[]);let _=s((x,E="info",R=4200)=>{let I=C.current++;w(N=>[...N,{id:I,msg:x,kind:E}]),setTimeout(()=>w(N=>N.filter(O=>O.id!==I)),R)},[]),b=s(x=>w(E=>E.filter(R=>R.id!==x)),[]),y=window.CG.makeT(p),M={theme:c,setTheme:u,toggleTheme:()=>u(x=>x==="dark"?"light":"dark"),lang:p,setLang:f,toggleLang:()=>f(x=>x==="th"?"en":"th"),user:h,setUser:g,booted:T,toast:_,toasts:d,dismissToast:b,t:y};return React.createElement(r.Provider,{value:M},l)}window.CG.Store={Provider:o,useStore:()=>e(r)}})();(function(){let{useState:i,useEffect:e,useRef:t}=React,n=({name:d,className:w="w-5 h-5",...C})=>{let _={grid:"M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2zM9 3v16M15 5v16",brain:"M12 5a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 0 3 3 0 0 0 2-4 3 3 0 0 0-1-5 3 3 0 0 0-3-3zM12 5v14",satellite:"M5 13l-2 2 4 4 2-2M13 5l2-2 4 4-2 2M9 9l6 6M7 11l-4 4 2 2 4-4M17 13l4-4-2-2-4 4",cloud:"M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 17 18H7z",soil:"M3 7h18M3 12h18M3 17h18M6 7v10M12 7v10M18 7v10",bulb:"M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",history:"M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 8v4l3 2",book:"M4 5a3 3 0 0 1 3-2h5v18H7a3 3 0 0 0-3 2V5zM20 5a3 3 0 0 0-3-2h-5v18h5a3 3 0 0 1 3 2V5z",cpu:"M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M6 6h12v12H6zM10 10h4v4h-4z",bell:"M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0",sun:"M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",moon:"M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z",globe:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 4 5.6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.6-4-9s1.5-6.5 4-9z",logout:"M15 12H3M11 8l-4 4 4 4M9 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9",upload:"M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",download:"M12 4v12M8 12l4 4 4-4M4 18v2h16v-2",search:"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3",close:"M6 6l12 12M18 6 6 18",check:"M5 13l4 4L19 7",alert:"M12 3 2 20h20L12 3zM12 9v5M12 17v.5",drop:"M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z",leaf:"M4 20s0-8 6-12 10-4 10-4 0 8-6 12S4 20 4 20zM10 14s2-4 6-6",chevron:"M9 6l6 6-6 6",temp:"M12 3a2 2 0 0 0-2 2v9a4 4 0 1 0 4 0V5a2 2 0 0 0-2-2z",wind:"M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9",plus:"M12 5v14M5 12h14",menu:"M4 7h16M4 12h16M4 17h16",play:"M8 5v14l11-7L8 5z",activity:"M3 12h4l2-7 4 14 2-7h6",privacy:"M12 3 4 6v5c0 5.2 3.4 8.6 8 10 4.6-1.4 8-4.8 8-10V6l-8-3zM9 12l2 2 4-4",camera:"M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"};return React.createElement("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",className:w,...C},React.createElement("path",{d:_[d]||_.grid}))},s=({className:d="",children:w,hover:C=!1,pad:_="p-5",...b})=>React.createElement("section",{className:`glass cg-card ${_} ${C?"card-hover":""} ${d}`,...b},w),a=({icon:d,title:w,sub:C,right:_})=>React.createElement("div",{className:"cg-section-title flex items-center justify-between mb-5 gap-3"},React.createElement("div",{className:"flex items-center gap-3 min-w-0"},d&&React.createElement("div",{className:"cg-section-icon"},React.createElement(n,{name:d})),React.createElement("div",{className:"min-w-0"},React.createElement("h3",{className:"txt font-bold text-base leading-tight"},w),C&&React.createElement("p",{className:"txt-soft text-sm mt-1 leading-snug"},C))),_);function r(d,w=900){let[C,_]=i(0),b=t();return e(()=>{let y=performance.now(),M=0,x=E=>{let R=Math.min(1,(E-y)/w),I=1-Math.pow(1-R,3);_(M+(d-M)*I),R<1&&(b.current=requestAnimationFrame(x))};return b.current=requestAnimationFrame(x),()=>cancelAnimationFrame(b.current)},[d]),C}let o=({icon:d,label:w,value:C,suffix:_="",decimals:b=0,tone:y="brand",spark:M,delta:x,delay:E=0})=>{let R=r(Number(C)||0),I={brand:"from-brand-500/20 to-cyan2/10 text-brand-300",cyan:"from-cyan2/20 to-brand-500/10 text-cyan2-light",amber:"from-amber-500/20 to-orange-500/10 text-amber-300",rose:"from-rose-500/20 to-red-500/10 text-rose-300",violet:"from-violet-500/20 to-fuchsia-500/10 text-violet-300"},N=O=>b?O.toLocaleString(void 0,{minimumFractionDigits:b,maximumFractionDigits:b}):Math.round(O).toLocaleString();return React.createElement(s,{hover:!0,className:"animate-fadeup relative overflow-hidden",style:{animationDelay:E+"ms"}},React.createElement("div",{className:`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${I[y]} blur-2xl opacity-60`}),React.createElement("div",{className:"flex items-start justify-between relative"},React.createElement("div",{className:`w-11 h-11 rounded-xl bg-gradient-to-br ${I[y]} grid place-items-center`},React.createElement(n,{name:d,className:"w-5 h-5"})),x!=null&&React.createElement("span",{className:`text-xs font-semibold px-2 py-0.5 rounded-full ${x>=0?"text-brand-300 bg-brand-500/10":"text-rose-300 bg-rose-500/10"}`},x>=0?"\u25B2":"\u25BC"," ",Math.abs(x),"%")),React.createElement("div",{className:"mt-4 relative"},React.createElement("div",{className:"txt text-3xl font-bold tracking-tight tabular-nums"},N(R),React.createElement("span",{className:"text-lg txt-soft font-semibold"},_)),React.createElement("div",{className:"txt-soft text-xs mt-1 font-medium"},w)),M)},l=({tone:d="brand",children:w,dot:C=!1,className:_=""})=>{let b={brand:"text-brand-300 bg-brand-500/12 border-brand-500/25",low:"text-brand-300 bg-brand-500/12 border-brand-500/25",optimal:"text-brand-300 bg-brand-500/12 border-brand-500/25",online:"text-brand-300 bg-brand-500/12 border-brand-500/25",medium:"text-amber-300 bg-amber-500/12 border-amber-500/25",warning:"text-amber-300 bg-amber-500/12 border-amber-500/25",high:"text-rose-300 bg-rose-500/12 border-rose-500/25",critical:"text-rose-300 bg-rose-500/12 border-rose-500/25",info:"text-cyan2-light bg-cyan2/12 border-cyan2/25",slate:"txt-soft bg-slate-500/10 border-slate-500/20",healthy:"text-brand-300 bg-brand-500/12 border-brand-500/25",cmd:"text-red-300 bg-red-500/12 border-red-500/25",cbsd:"text-orange-300 bg-orange-500/12 border-orange-500/25",cbb:"text-amber-300 bg-amber-500/12 border-amber-500/25",cgm:"text-violet-300 bg-violet-500/12 border-violet-500/25",cad:"text-teal-300 bg-teal-500/12 border-teal-500/25",brown_leaf_spot:"text-yellow-300 bg-yellow-500/12 border-yellow-500/25",white_leaf_spot:"text-lime-300 bg-lime-500/12 border-lime-500/25",sed:"text-cyan-300 bg-cyan-500/12 border-cyan-500/25",mealybug:"text-fuchsia-300 bg-fuchsia-500/12 border-fuchsia-500/25",whitefly:"text-pink-300 bg-pink-500/12 border-pink-500/25",water_stress:"text-sky-300 bg-sky-500/12 border-sky-500/25",nutrient_def:"text-indigo-300 bg-indigo-500/12 border-indigo-500/25"};return React.createElement("span",{className:`cg-badge inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${b[d]||b.slate} ${_}`},C&&React.createElement("span",{className:"w-1.5 h-1.5 rounded-full bg-current animate-pulse"}),w)},c=({value:d=0,size:w=92,stroke:C=8,label:_,sub:b,tone:y})=>{let M=(w-C)/2,x=2*Math.PI*M,E=Math.max(0,Math.min(100,d)),R=y||(E>=78?"#10b981":E>=60?"#f59e0b":"#f43f5e"),[I,N]=i(x);return e(()=>{let O=setTimeout(()=>N(x-E/100*x),60);return()=>clearTimeout(O)},[E,x]),React.createElement("div",{className:"relative grid place-items-center",style:{width:w,height:w}},React.createElement("svg",{width:w,height:w,className:"-rotate-90"},React.createElement("circle",{cx:w/2,cy:w/2,r:M,strokeWidth:C,className:"hair",stroke:"currentColor",fill:"none",opacity:"0.25"}),React.createElement("circle",{cx:w/2,cy:w/2,r:M,strokeWidth:C,stroke:R,fill:"none",strokeLinecap:"round",strokeDasharray:x,strokeDashoffset:I,style:{transition:"stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)"}})),React.createElement("div",{className:"absolute text-center"},React.createElement("div",{className:"txt font-bold text-lg tabular-nums"},Math.round(E),React.createElement("span",{className:"text-xs"},b||"%")),_&&React.createElement("div",{className:"txt-dim text-[10px] mt-0.5"},_)))},u=({className:d="h-4 w-full",rounded:w="rounded-lg"})=>React.createElement("div",{className:`skeleton ${w} ${d}`}),p=({h:d="h-28"})=>React.createElement(s,null,React.createElement("div",{className:"space-y-3"},React.createElement(u,{className:"h-9 w-9",rounded:"rounded-xl"}),React.createElement(u,{className:`${d} w-full`}),React.createElement(u,{className:"h-3 w-2/3"}))),f=()=>{let{toasts:d,dismissToast:w}=window.CG.Store.useStore(),C={info:"info",success:"low",error:"high",warn:"medium"},_={info:"bell",success:"check",error:"alert",warn:"alert"};return React.createElement("div",{className:"fixed z-[9999] bottom-5 right-5 flex flex-col gap-2 w-[min(92vw,360px)]"},d.map(b=>React.createElement("div",{key:b.id,className:"glass-strong rounded-xl p-3.5 flex items-start gap-3 animate-slidein shadow-xl"},React.createElement("div",{className:`shrink-0 mt-0.5 ${b.kind==="error"?"text-rose-400":b.kind==="success"?"text-brand-400":b.kind==="warn"?"text-amber-400":"text-cyan2-light"}`},React.createElement(n,{name:_[b.kind]||"bell",className:"w-4 h-4"})),React.createElement("div",{className:"txt text-sm flex-1 leading-snug"},b.msg),React.createElement("button",{onClick:()=>w(b.id),className:"txt-dim hover:txt"},React.createElement(n,{name:"close",className:"w-4 h-4"})))))},h=({open:d,onClose:w,title:C,children:_,wide:b=!1})=>(e(()=>{if(!d)return;let y=M=>M.key==="Escape"&&w();return window.addEventListener("keydown",y),()=>window.removeEventListener("keydown",y)},[d,w]),d?React.createElement("div",{className:"fixed inset-0 z-[9000] grid place-items-center p-4 animate-fadein",onMouseDown:w},React.createElement("div",{className:"absolute inset-0 bg-black/55 backdrop-blur-sm"}),React.createElement("div",{onMouseDown:y=>y.stopPropagation(),className:`glass-strong cg-modal relative w-full ${b?"max-w-4xl":"max-w-lg"} max-h-[88vh] overflow-y-auto no-scrollbar animate-fadeup shadow-2xl`},React.createElement("div",{className:"flex items-center justify-between p-5 border-b hair sticky top-0 glass-strong z-10"},React.createElement("h3",{className:"txt font-bold text-lg"},C),React.createElement("button",{onClick:w,className:"txt-dim hover:txt w-8 h-8 grid place-items-center rounded-lg hover:bg-white/5"},React.createElement(n,{name:"close"}))),React.createElement("div",{className:"p-5"},_))):null),g=({options:d,value:w,onChange:C,size:_="text-xs"})=>React.createElement("div",{className:"cg-segmented inline-flex p-1 glass gap-1"},d.map(b=>React.createElement("button",{key:b.value,onClick:()=>C(b.value),className:`px-3 py-2 rounded-xl font-semibold transition ${_} ${w===b.value?"grad-brand text-white shadow":"txt-soft hover:txt"}`},b.label))),T=({className:d="w-5 h-5"})=>React.createElement("svg",{className:`animate-spin ${d}`,viewBox:"0 0 24 24",fill:"none"},React.createElement("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"3",opacity:"0.2"}),React.createElement("path",{d:"M12 2a10 10 0 0 1 10 10",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round"})),m=({icon:d="grid",text:w})=>React.createElement("div",{className:"flex flex-col items-center justify-center py-12 txt-dim gap-2"},React.createElement(n,{name:d,className:"w-9 h-9 opacity-50"}),React.createElement("p",{className:"text-sm"},w));window.CG.UI={Icon:n,Card:s,SectionTitle:a,KPICard:o,Badge:l,ProgressRing:c,Skeleton:u,SkelCard:p,ToastHost:f,Modal:h,Segmented:g,Spinner:T,Empty:m,useCountUp:r}})();(function(){let{useRef:i,useEffect:e}=React;function t(){let h=document.documentElement.classList.contains("light");return{grid:h?"rgba(15,23,42,.08)":"rgba(148,163,184,.12)",tick:h?"#5b6b82":"#93a4bd",brand:"#10b981",cyan:"#06b6d4",amber:"#f59e0b",rose:"#f43f5e",violet:"#8b5cf6",blue:"#3b82f6"}}let n={healthy:"#10b981",cmd:"#ef4444",cbsd:"#f97316",cbb:"#f59e0b",cgm:"#8b5cf6",cad:"#14b8a6",brown_leaf_spot:"#eab308",white_leaf_spot:"#84cc16",sed:"#06b6d4",mealybug:"#d946ef",whitefly:"#ec4899",water_stress:"#0ea5e9",nutrient_def:"#6366f1"};function s(h={}){let g=t();return{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:"index"},plugins:{legend:{display:!1,labels:{color:g.tick,boxWidth:10,usePointStyle:!0}},tooltip:{backgroundColor:"rgba(9,14,26,.94)",borderColor:"rgba(148,163,184,.2)",borderWidth:1,titleColor:"#e5edf7",bodyColor:"#cbd5e1",padding:10,cornerRadius:10,displayColors:!0,boxPadding:4}},scales:{x:{grid:{color:g.grid,drawBorder:!1},ticks:{color:g.tick,font:{size:10},maxRotation:0,autoSkip:!0,maxTicksLimit:8}},y:{grid:{color:g.grid,drawBorder:!1},ticks:{color:g.tick,font:{size:10}}}},...h}}function a({type:h,data:g,options:T,height:m=240,plugins:d}){let w=i(null),C=i(null);return e(()=>{if(!w.current)return;let _=w.current.getContext("2d");return C.current=new window.Chart(_,{type:h,data:g,options:T,plugins:d}),()=>C.current&&C.current.destroy()},[JSON.stringify(g),JSON.stringify(T),h]),React.createElement("div",{style:{height:m}},React.createElement("canvas",{ref:w}))}function r(h,g,T,m){if(!g)return T;let d=h.createLinearGradient(0,g.top,0,g.bottom);return d.addColorStop(0,T),d.addColorStop(1,m),d}let o=({labels:h,series:g,height:T=240,fill:m=!0,opts:d={}})=>{let w=t(),C=[w.brand,w.cyan,w.amber,w.violet,w.rose],_={labels:h,datasets:g.map((b,y)=>({label:b.label,data:b.data,borderColor:b.color||C[y%C.length],borderWidth:2,tension:.38,pointRadius:0,pointHoverRadius:4,fill:m&&g.length===1,backgroundColor:M=>r(M.chart.ctx,M.chart.chartArea,(b.color||C[y%C.length])+"44",(b.color||C[y%C.length])+"02")}))};return React.createElement(a,{type:"line",data:_,height:T,options:s({plugins:{legend:{display:g.length>1,labels:{color:w.tick,boxWidth:10,usePointStyle:!0}}},...d})})},l=({labels:h,series:g,height:T=240,horizontal:m=!1,stacked:d=!1,opts:w={}})=>{let C=t(),_=[C.brand,C.cyan,C.amber,C.violet,C.rose,C.blue],b={labels:h,datasets:g.map((M,x)=>({label:M.label,data:M.data,backgroundColor:M.colors||(M.color||_[x%_.length])+"cc",borderRadius:7,borderSkipped:!1,barPercentage:.72,categoryPercentage:.78}))},y=s({indexAxis:m?"y":"x",plugins:{legend:{display:g.length>1,labels:{color:C.tick,boxWidth:10,usePointStyle:!0}}},scales:{x:{stacked:d,grid:{color:C.grid},ticks:{color:C.tick,font:{size:10}}},y:{stacked:d,grid:{color:C.grid},ticks:{color:C.tick,font:{size:10}}}},...w});return React.createElement(a,{type:"bar",data:b,height:T,options:y})},c=({labels:h,values:g,colors:T,height:m=220,cutout:d="68%",centerText:w})=>{let C=t(),_={labels:h,datasets:[{data:g,backgroundColor:T,borderWidth:0,hoverOffset:6}]},b=s({cutout:d,scales:{},plugins:{legend:{display:!0,position:"bottom",labels:{color:C.tick,boxWidth:10,usePointStyle:!0,padding:12}}}});return React.createElement(a,{type:"doughnut",data:_,height:m,options:b})},u=({labels:h,series:g,height:T=260})=>{let m=t(),d=[m.brand,m.cyan,m.amber],w={labels:h,datasets:g.map((_,b)=>({label:_.label,data:_.data,borderColor:_.color||d[b%d.length],borderWidth:2,backgroundColor:(_.color||d[b%d.length])+"22",pointBackgroundColor:_.color||d[b%d.length],pointRadius:3}))},C=s({scales:{r:{angleLines:{color:m.grid},grid:{color:m.grid},pointLabels:{color:m.tick,font:{size:10}},ticks:{display:!1,backdropColor:"transparent"},suggestedMin:0,suggestedMax:100}},plugins:{legend:{display:g.length>1,position:"bottom",labels:{color:m.tick,boxWidth:10,usePointStyle:!0}}}});return React.createElement(a,{type:"radar",data:w,height:T,options:C})},p=({points:h,height:g=240,xLabel:T,yLabel:m})=>{let d=t(),w={datasets:[{data:h,backgroundColor:d.cyan+"cc",pointRadius:5,pointHoverRadius:7}]},C=s({scales:{x:{title:{display:!!T,text:T,color:d.tick},grid:{color:d.grid},ticks:{color:d.tick,font:{size:10}}},y:{title:{display:!!m,text:m,color:d.tick},grid:{color:d.grid},ticks:{color:d.tick,font:{size:10}}}}});return React.createElement(a,{type:"scatter",data:w,height:g,options:C})},f=({items:h,height:g=200})=>{let T=t(),m=h.map(d=>n[d.key]||T.rose);return React.createElement(l,{labels:h.map(d=>d.label),height:g,series:[{label:"Probability",data:h.map(d=>Math.round(d.value*1e3)/10),colors:m.map(d=>d+"cc")}],opts:{scales:{y:{max:100,grid:{color:T.grid},ticks:{color:T.tick,callback:d=>d+"%"}},x:{grid:{display:!1},ticks:{color:T.tick,font:{size:9}}}}}})};window.CG.Charts={LineChart:o,BarChart:l,DoughnutChart:c,RadarChart:u,ScatterChart:p,ProbBars:f,themeColors:t}})();(function(){let{useRef:i,useEffect:e,useState:t}=React,n=window.L,s={low:"#10b981",medium:"#f59e0b",high:"#f43f5e"};n&&n.Icon&&n.Icon.Default&&n.Icon.Default.mergeOptions({iconRetinaUrl:"./vendor/leaflet/images/marker-icon-2x.png",iconUrl:"./vendor/leaflet/images/marker-icon.png",shadowUrl:"./vendor/leaflet/images/marker-shadow.png"});let a={satellite:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attr:"Esri World Imagery",max:19},street:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attr:"\xA9 OpenStreetMap",max:19},topo:{url:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",attr:"\xA9 OpenTopoMap",max:17},dark:{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attr:"\xA9 CARTO",max:19}};function r({fields:o,geojson:l,onSelect:c,selectedId:u,height:p="100%",base:f="satellite",overlay:h="risk",gridData:g=null}){let T=i(null),m=i(null),d=i(null),w=i(null),C=i(null);return e(()=>{if(m.current||!T.current)return;let _=o&&o.length?[o[0].lat,o[0].lon]:[15,101.7],b=n.map(T.current,{center:_,zoom:11,zoomControl:!0,attributionControl:!0});return m.current=b,d.current=n.layerGroup().addTo(b),C.current=n.layerGroup().addTo(b),setTimeout(()=>b.invalidateSize(),100),()=>{b.remove(),m.current=null}},[]),e(()=>{let _=m.current;if(!_)return;w.current&&_.removeLayer(w.current);let b=a[f]||a.satellite;w.current=n.tileLayer(b.url,{attribution:b.attr,maxZoom:b.max,subdomains:"abc"}).addTo(_),w.current.bringToBack()},[f]),e(()=>{let _=m.current,b=d.current;if(!_||!b||!l)return;b.clearLayers();let y=[];l.features.forEach(M=>{let x=M.properties,E=M.geometry.coordinates[0].map(O=>[O[1],O[0]]);y.push(...E);let R=s[x.risk_level]||"#10b981",I=x.id===u,N=n.polygon(E,{color:R,weight:I?3:1.6,fillColor:R,fillOpacity:h==="risk"?I?.5:.32:.12,opacity:.9});N.on("click",()=>c&&c(x.id)),N.on("mouseover",()=>N.setStyle({fillOpacity:.5,weight:3})),N.on("mouseout",()=>N.setStyle({fillOpacity:h==="risk"?I?.5:.32:.12,weight:I?3:1.6})),N.bindTooltip(`<div style="font-weight:600">${x.name_th||x.name}</div>
           <div style="opacity:.8;font-size:11px">${x.province} \xB7 ${x.variety}</div>
           <div style="font-size:11px;margin-top:2px">Health ${x.health_score}% \xB7 ${x.risk_level.toUpperCase()}</div>`,{sticky:!0,opacity:.95}),b.addLayer(N),n.circleMarker([x.lat,x.lon],{radius:4,color:"#fff",weight:1.5,fillColor:R,fillOpacity:1}).on("click",()=>c&&c(x.id)).addTo(b)}),y.length&&!u&&_.fitBounds(y,{padding:[40,40],maxZoom:12})},[JSON.stringify(l),u,h]),e(()=>{let _=m.current;if(!_||!u||!o)return;let b=o.find(y=>y.id===u);b&&_.flyTo([b.lat,b.lon],14,{duration:.8})},[u]),e(()=>{let _=C.current;if(!_||(_.clearLayers(),!g||!g.field||h==="risk"))return;let{field:b,grid:y,index:M}=g,x=JSON.parse(b.boundary_json||"[]");if(!x.length)return;let E=x.map(U=>U[0]),R=x.map(U=>U[1]),I=Math.min(...E),N=Math.max(...E),O=Math.min(...R),A=Math.max(...R),D=y.grid_size,L=(A-O)/D,V=(N-I)/D,X={ndvi:U=>U>.6?"#065f46":U>.45?"#10b981":U>.3?"#fbbf24":"#dc2626",ndwi:U=>U>.2?"#0369a1":U>0?"#38bdf8":U>-.2?"#fcd34d":"#b45309",savi:U=>U>.55?"#065f46":U>.4?"#10b981":U>.25?"#fbbf24":"#dc2626",evi:U=>U>.55?"#065f46":U>.4?"#10b981":U>.25?"#fbbf24":"#dc2626"},H=X[M]||X.ndvi;for(let U=0;U<D;U++)for(let J=0;J<D;J++){let Y=y.cells[U][J],ae=O+(D-1-U)*L,Pe=I+J*V;n.rectangle([[ae,Pe],[ae+L,Pe+V]],{color:H(Y),weight:0,fillColor:H(Y),fillOpacity:.6}).bindTooltip(`${M.toUpperCase()}: ${Y}`,{sticky:!0}).addTo(_)}},[JSON.stringify(g),h]),React.createElement("div",{ref:T,style:{height:p,width:"100%",borderRadius:16,zIndex:0}})}window.CG.MapView=r,window.CG.RISK_COLOR=s})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,KPICard:s,Badge:a,ProgressRing:r,SkelCard:o,Skeleton:l,Icon:c,Empty:u}=window.CG.UI,{DoughnutChart:p,BarChart:f,LineChart:h}=window.CG.Charts,g={sunny:"sun",partly_cloudy:"cloud",cloudy:"cloud",rain:"drop",storm:"drop"};function T({go:m}){let{t:d,lang:w,toast:C}=window.CG.Store.useStore(),[_,b]=i(null),[y,M]=i(null),[x,E]=i(null),[R,I]=i(null);if(e(()=>{let A=window.CG.API_CLIENT;Promise.all([A.kpis(),A.riskDist(),A.healthByField(),A.weatherHistory(null,14)]).then(([D,L,V,X])=>{b(D),M(L),E(V),I(X)}).catch(D=>C(D.message,"error"))},[]),!_)return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},[0,1,2,3].map(A=>React.createElement(o,{key:A}))),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},[0,1,2].map(A=>React.createElement(o,{key:A,h:"h-48"}))));let N=y||{low:0,medium:0,high:0},O=(R?.series||[]).map(A=>A.date.slice(5));return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},React.createElement(s,{icon:"map",label:d("kpi_fields"),value:_.total_fields,tone:"brand",delay:0}),React.createElement(s,{icon:"leaf",label:d("kpi_plants"),value:_.total_plants,tone:"cyan",delay:60,spark:React.createElement("div",{className:"txt-dim text-[11px] mt-2"},_.total_area_rai.toLocaleString()," ",d("rai"))}),React.createElement(s,{icon:"check",label:d("kpi_healthy"),value:_.healthy_pct,suffix:"%",decimals:1,tone:"brand",delay:120}),React.createElement(s,{icon:"alert",label:d("kpi_risk"),value:_.high_risk_pct,suffix:"%",decimals:1,tone:"rose",delay:180})),React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},React.createElement(s,{icon:"brain",label:d("kpi_disease"),value:_.disease_alerts,tone:"rose",delay:0}),React.createElement(s,{icon:"soil",label:d("kpi_nutrient"),value:_.nutrient_alerts,tone:"amber",delay:60}),React.createElement(s,{icon:"drop",label:d("kpi_water"),value:_.water_alerts,tone:"cyan",delay:120}),React.createElement(s,{icon:"cpu",label:d("kpi_health"),value:_.avg_health,suffix:"%",decimals:1,tone:"violet",delay:180})),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"grid",title:d("risk_dist"),sub:`${_.total_fields} ${d("kpi_fields")}`}),React.createElement(p,{height:210,labels:[d("low"),d("medium"),d("high")],values:[N.low,N.medium,N.high],colors:["#10b981","#f59e0b","#f43f5e"]})),React.createElement(t,{className:"animate-fadeup lg:col-span-2",style:{animationDelay:"80ms"}},React.createElement(n,{icon:"map",title:d("field_health"),sub:d("dash_sub"),right:React.createElement(a,{tone:"online",dot:!0},d("online"))}),React.createElement(f,{height:210,horizontal:!0,labels:(x||[]).map(A=>w==="th"?A.name_th:A.name),series:[{label:"Health",data:(x||[]).map(A=>A.health),colors:(x||[]).map(A=>window.CG.RISK_COLOR[A.risk]+"cc")}],opts:{scales:{x:{max:100,grid:{color:"rgba(148,163,184,.12)"},ticks:{color:"#93a4bd",callback:A=>A+"%"}},y:{grid:{display:!1},ticks:{color:"#93a4bd",font:{size:10}}}}}}))),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup relative overflow-hidden"},React.createElement("div",{className:"absolute -right-8 -top-8 w-32 h-32 rounded-full bg-cyan2/10 blur-2xl"}),React.createElement(n,{icon:"cloud",title:d("weather_now")}),React.createElement("div",{className:"flex items-center gap-4"},React.createElement("div",{className:"w-16 h-16 rounded-2xl grad-brand grid place-items-center text-white shrink-0"},React.createElement(c,{name:g[_.weather.condition]||"cloud",className:"w-8 h-8"})),React.createElement("div",null,React.createElement("div",{className:"txt text-4xl font-bold tabular-nums"},_.weather.temp_c,"\xB0"),React.createElement("div",{className:"txt-soft text-sm"},w==="th"?_.weather.condition_th:_.weather.condition.replace("_"," ")))),React.createElement("div",{className:"grid grid-cols-2 gap-2 mt-4 text-sm"},React.createElement("div",{className:"glass rounded-xl p-3"},React.createElement("div",{className:"txt-dim text-xs"},"Humidity"),React.createElement("div",{className:"txt font-semibold"},_.weather.humidity_pct,"%")),React.createElement("div",{className:"glass rounded-xl p-3"},React.createElement("div",{className:"txt-dim text-xs"},"Rain 7d"),React.createElement("div",{className:"txt font-semibold"},_.weather.rain_7d_mm," mm"))),_.weather.warnings.length>0&&React.createElement("div",{className:"mt-3 space-y-1.5"},_.weather.warnings.map((A,D)=>React.createElement("div",{key:D,className:"flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 rounded-lg px-2.5 py-1.5"},React.createElement(c,{name:"alert",className:"w-3.5 h-3.5 shrink-0"}),w==="th"?A.th:A.en)))),React.createElement(t,{className:"animate-fadeup lg:col-span-2",style:{animationDelay:"80ms"}},React.createElement(n,{icon:"cloud",title:d("trend"),sub:"14 days \xB7 temp & rainfall",right:React.createElement("button",{onClick:()=>m("weather"),className:"txt-soft hover:txt text-xs flex items-center gap-1"},d("view"),React.createElement(c,{name:"chevron",className:"w-3.5 h-3.5"}))}),React.createElement(h,{height:210,fill:!0,labels:O,series:[{label:"Temp \xB0C",data:(R?.series||[]).map(A=>A.temp_c),color:"#f59e0b"},{label:"Rain mm",data:(R?.series||[]).map(A=>A.rainfall_mm),color:"#06b6d4"}]}))),React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"satellite",title:d("sat_status"),sub:`${_.satellite.online}/${_.satellite.constellation.length} ${d("online")}`,right:React.createElement("button",{onClick:()=>m("satellite"),className:"txt-soft hover:txt text-xs flex items-center gap-1"},d("view"),React.createElement(c,{name:"chevron",className:"w-3.5 h-3.5"}))}),React.createElement("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3"},_.satellite.constellation.map((A,D)=>React.createElement("div",{key:D,className:"glass rounded-xl p-3.5 relative"},React.createElement("div",{className:"flex items-center justify-between"},React.createElement(c,{name:"satellite",className:"w-5 h-5 text-cyan2-light"}),React.createElement("span",{className:"relative flex h-2.5 w-2.5"},A.status==="online"&&React.createElement("span",{className:"absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-pulsering"}),React.createElement("span",{className:`relative inline-flex rounded-full h-2.5 w-2.5 ${A.status==="online"?"bg-brand-400":"bg-amber-400"}`}))),React.createElement("div",{className:"txt font-semibold text-sm mt-2"},A.name),React.createElement("div",{className:"txt-dim text-[11px] mt-0.5"},A.resolution_m,"m \xB7 ",A.revisit_days,"d revisit"))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Dashboard=T})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,ProgressRing:a,Icon:r,Segmented:o,Spinner:l,Skeleton:c,Modal:u}=window.CG.UI,{LineChart:p}=window.CG.Charts,f=[{value:"satellite",label:"Satellite"},{value:"street",label:"Street"},{value:"topo",label:"Topo"},{value:"dark",label:"Dark"}],h=[{value:"risk",label:"Risk"},{value:"ndvi",label:"NDVI"},{value:"ndwi",label:"NDMI"},{value:"savi",label:"SAVI"}];function g({go:b}){let{t:y,lang:M,toast:x,user:E}=window.CG.Store.useStore(),[R,I]=i(null),[N,O]=i([]),[A,D]=i(null),[L,V]=i(null),[X,H]=i("satellite"),[U,J]=i("risk"),[Y,ae]=i(null),[Pe,Ee]=i(!1),we=(j=null)=>{let ce=window.CG.API_CLIENT;return Promise.all([ce.fieldsGeo(),ce.fields()]).then(([be,ge])=>{I(be),O(ge),j?D(j):ge.length&&D(Oe=>Oe||ge[0].id)}).catch(be=>x(be.message,"error"))};e(()=>{we()},[]),e(()=>{A&&(V(null),window.CG.API_CLIENT.field(A).then(V).catch(j=>x(j.message,"error")))},[A]),e(()=>{if(!A||U==="risk"){ae(null);return}window.CG.API_CLIENT.satGrid(A,U).then(j=>ae({field:L,grid:j,index:U})).catch(()=>{})},[A,U,L]);let K=window.CG.MapView;return React.createElement(React.Fragment,null,React.createElement("div",{className:"grid lg:grid-cols-3 gap-4 h-full"},React.createElement(t,{pad:"p-0",className:"lg:col-span-2 overflow-hidden relative min-h-[520px] animate-fadeup"},React.createElement("div",{className:"absolute top-3 left-3 right-3 z-[500] flex flex-wrap gap-2 justify-between pointer-events-none"},React.createElement("div",{className:"pointer-events-auto"},React.createElement(o,{options:f,value:X,onChange:H})),React.createElement("div",{className:"pointer-events-auto flex gap-2"},E.role!=="researcher"&&React.createElement("button",{onClick:()=>Ee(!0),className:"glass-strong rounded-xl px-3 py-2 txt-soft hover:txt flex items-center gap-1.5 text-xs font-semibold"},React.createElement(r,{name:"plus",className:"w-4 h-4"}),M==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07":"Add field"),React.createElement(o,{options:h,value:U,onChange:J}))),React.createElement("div",{className:"absolute bottom-3 left-3 z-[500] glass-strong rounded-xl px-3 py-2 text-[11px] txt-soft"},U==="risk"?React.createElement("div",{className:"flex items-center gap-3"},[["low",y("low")],["medium",y("medium")],["high",y("high")]].map(([j,ce])=>React.createElement("span",{key:j,className:"flex items-center gap-1"},React.createElement("span",{className:"w-2.5 h-2.5 rounded-sm",style:{background:window.CG.RISK_COLOR[j]}}),ce))):React.createElement("div",{className:"flex items-center gap-2"},React.createElement("span",{className:"font-semibold txt"},U.toUpperCase()),React.createElement("span",{className:"w-24 h-2.5 rounded-full",style:{background:"linear-gradient(90deg,#dc2626,#fbbf24,#10b981,#065f46)"}}),React.createElement("span",null,"low \u2192 high"))),R?React.createElement(K,{fields:N,geojson:R,onSelect:D,selectedId:A,base:X,overlay:U,gridData:Y}):React.createElement("div",{className:"h-full grid place-items-center"},React.createElement(l,{className:"w-8 h-8 text-brand-400"}))),React.createElement("div",{className:"space-y-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] pr-1"},L?React.createElement(d,{d:L,go:b}):React.createElement(t,null,React.createElement("div",{className:"space-y-3"},React.createElement(c,{className:"h-6 w-2/3"}),React.createElement(c,{className:"h-24 w-full"}),React.createElement(c,{className:"h-16 w-full"}))))),React.createElement(T,{open:Pe,onClose:()=>Ee(!1),onCreated:async j=>{await we(j.id),Ee(!1)}}))}function T({open:b,onClose:y,onCreated:M}){let{lang:x,toast:E}=window.CG.Store.useStore(),[R,I]=i(!1),[N,O]=i({name:"",name_th:"",province:"",variety:"KU50",area_rai:"10",lat:"15",lon:"102"}),A=(L,V)=>O(X=>({...X,[L]:V}));return React.createElement(u,{open:b,onClose:y,title:x==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1E\u0E32\u0E30\u0E1B\u0E25\u0E39\u0E01":"Add field"},React.createElement("form",{onSubmit:async L=>{L.preventDefault(),I(!0);try{let V=await window.CG.API_CLIENT.createField({...N,area_rai:Number(N.area_rai),lat:Number(N.lat),lon:Number(N.lon)});E(x==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E49\u0E27":"Field created","success"),await M(V)}catch(V){E(V.message,"error")}finally{I(!1)}},className:"grid sm:grid-cols-2 gap-3"},React.createElement(m,{label:x==="th"?"\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1B\u0E25\u0E07 (\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29)":"Field name",value:N.name,onChange:L=>A("name",L),required:!0}),React.createElement(m,{label:x==="th"?"\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1B\u0E25\u0E07 (\u0E44\u0E17\u0E22)":"Thai name",value:N.name_th,onChange:L=>A("name_th",L)}),React.createElement(m,{label:x==="th"?"\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14":"Province",value:N.province,onChange:L=>A("province",L)}),React.createElement(m,{label:x==="th"?"\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C":"Variety",value:N.variety,onChange:L=>A("variety",L),required:!0}),React.createElement(m,{label:x==="th"?"\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48 (\u0E44\u0E23\u0E48)":"Area (rai)",type:"number",min:"0.1",step:"0.1",value:N.area_rai,onChange:L=>A("area_rai",L),required:!0}),React.createElement("div",null),React.createElement(m,{label:"Latitude",type:"number",min:"-90",max:"90",step:"0.000001",value:N.lat,onChange:L=>A("lat",L),required:!0}),React.createElement(m,{label:"Longitude",type:"number",min:"-180",max:"180",step:"0.000001",value:N.lon,onChange:L=>A("lon",L),required:!0}),React.createElement("div",{className:"sm:col-span-2 flex justify-end gap-2 pt-2"},React.createElement("button",{type:"button",onClick:y,className:"glass rounded-xl px-4 py-2 txt-soft text-sm"},x==="th"?"\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01":"Cancel"),React.createElement("button",{disabled:R,className:"grad-brand rounded-xl px-4 py-2 text-white text-sm font-semibold disabled:opacity-50"},R?x==="th"?"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u2026":"Saving\u2026":x==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E1B\u0E25\u0E07":"Save field"))))}function m({label:b,value:y,onChange:M,type:x="text",...E}){return React.createElement("label",{className:"txt-dim text-xs"},b,React.createElement("input",{type:x,value:y,onChange:R=>M(R.target.value),className:"w-full mt-1 glass rounded-xl px-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40",...E}))}function d({d:b,go:y}){let{t:M,lang:x}=window.CG.Store.useStore(),E=x==="th"&&b.name_th||b.name;return React.createElement(React.Fragment,null,React.createElement(t,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-start justify-between gap-2"},React.createElement("div",null,React.createElement("h3",{className:"txt font-bold text-lg leading-tight"},E),React.createElement("p",{className:"txt-soft text-xs mt-0.5"},b.province," \xB7 ",b.variety)),React.createElement(s,{tone:b.risk_level},M(b.risk_level))),React.createElement("div",{className:"flex items-center gap-4 mt-4"},React.createElement(a,{value:b.health_score,label:M("kpi_health")}),React.createElement("div",{className:"flex-1 grid grid-cols-2 gap-2 text-sm"},React.createElement(w,{label:M("rai"),value:b.area_rai}),React.createElement(w,{label:M("age"),value:`${b.age_days} ${M("days")}`}),React.createElement(w,{label:"Plants",value:b.plant_count.toLocaleString()}),React.createElement(w,{label:"NDVI",value:b.current_indices.ndvi??"\u2013"})))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"cloud",title:M("weather_now")}),React.createElement("div",{className:"grid grid-cols-3 gap-2 text-center text-sm"},React.createElement(C,{icon:"temp",v:`${b.weather.today.temp_c}\xB0`,l:"Temp"}),React.createElement(C,{icon:"drop",v:`${b.weather.today.humidity_pct}%`,l:"Humidity"}),React.createElement(C,{icon:"cloud",v:`${b.weather.rain_7d_mm}`,l:"Rain 7d mm"}))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"120ms"}},React.createElement(n,{icon:"satellite",title:"NDVI",sub:"8 months",right:React.createElement("button",{onClick:()=>y("satellite",b.id),className:"txt-soft hover:txt text-xs"},M("view"))}),React.createElement(p,{height:140,fill:!0,labels:b.ndvi_series.map(R=>R.date.slice(2,7)),series:[{label:"NDVI",data:b.ndvi_series.map(R=>R.ndvi),color:"#10b981"}],opts:{scales:{y:{min:0,max:1,grid:{color:"rgba(148,163,184,.12)"},ticks:{color:"#93a4bd",font:{size:9}}},x:{grid:{display:!1},ticks:{color:"#93a4bd",font:{size:9}}}}}})),b.predicted_risks.length>0&&React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"160ms"}},React.createElement(n,{icon:"alert",title:M("kpi_risk")}),React.createElement("div",{className:"space-y-2"},b.predicted_risks.map((R,I)=>React.createElement("div",{key:I,className:"flex items-center justify-between glass rounded-xl px-3 py-2"},React.createElement("span",{className:"txt text-sm"},x==="th"?R.th:R.en),React.createElement(s,{tone:R.severity,className:"shrink-0"},Math.round(R.confidence*100),"%"))))),b.recommendations.length>0&&React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"200ms"}},React.createElement(n,{icon:"bulb",title:M("recommendation"),right:React.createElement("button",{onClick:()=>y("recommendations",b.id),className:"txt-soft hover:txt text-xs"},M("view"))}),React.createElement(_,{r:b.recommendations[0]})))}let w=({label:b,value:y})=>React.createElement("div",{className:"glass rounded-lg px-2.5 py-1.5"},React.createElement("div",{className:"txt-dim text-[10px]"},b),React.createElement("div",{className:"txt font-semibold text-sm"},y)),C=({icon:b,v:y,l:M})=>React.createElement("div",{className:"glass rounded-xl py-3"},React.createElement(r,{name:b,className:"w-4 h-4 mx-auto text-cyan2-light"}),React.createElement("div",{className:"txt font-bold mt-1"},y),React.createElement("div",{className:"txt-dim text-[10px]"},M));function _({r:b}){let{lang:y}=window.CG.Store.useStore(),{Badge:M,Icon:x}=window.CG.UI;return React.createElement("div",null,React.createElement("div",{className:"flex items-center justify-between mb-2"},React.createElement("span",{className:"txt font-semibold text-sm"},y==="th"?b.title_th:b.title_en),React.createElement(M,{tone:b.severity},Math.round(b.confidence*100),"%")),React.createElement("ul",{className:"space-y-1"},(y==="th"?b.actions_th:b.actions_en).slice(0,2).map((E,R)=>React.createElement("li",{key:R,className:"flex items-start gap-2 txt-soft text-xs"},React.createElement(x,{name:"check",className:"w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5"}),E))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.FieldMap=g})();var bc=0,Qo=1,Sc=2;var Xs=1,mr=2,Yi=3,Yn=0,Gt=1,Ot=2,Sn=0,Zi=1,el=2,tl=3,nl=4,Mc=5;var li=100,wc=101,Tc=102,Ec=103,Ac=104,Cc=200,Rc=201,Nc=202,Ic=203,il=204,sl=205,Pc=206,Lc=207,Dc=208,Uc=209,Fc=210,Oc=211,Bc=212,kc=213,zc=214,Pa=0,La=1,Da=2,Ii=3,Ua=4,Fa=5,Oa=6,Ba=7,al=0,Gc=1,Vc=2,hn=0,rl=1,ol=2,ll=3,qs=4,cl=5,dl=6,hl=7;var ul=300,Zn=301,ci=302,gr=303,xr=304,$s=306,ka=1e3,vn=1001,za=1002,Ct=1003,Hc=1004;var Ys=1005;var Nt=1006,vr=1007;var Jn=1008;var qt=1009,fl=1010,pl=1011,Ji=1012,_r=1013,un=1014,fn=1015,pn=1016,yr=1017,br=1018,Ki=1020,ml=35902,gl=35899,xl=1021,vl=1022,an=1023,_n=1026,Kn=1027,_l=1028,Sr=1029,jn=1030,Mr=1031;var wr=1033,Zs=33776,Js=33777,Ks=33778,js=33779,Tr=35840,Er=35841,Ar=35842,Cr=35843,Rr=36196,Nr=37492,Ir=37496,Pr=37488,Lr=37489,Qs=37490,Dr=37491,Ur=37808,Fr=37809,Or=37810,Br=37811,kr=37812,zr=37813,Gr=37814,Vr=37815,Hr=37816,Wr=37817,Xr=37818,qr=37819,$r=37820,Yr=37821,Zr=36492,Jr=36494,Kr=36495,jr=36283,Qr=36284,ea=36285,eo=36286;var us=2300,Ga=2301,Na=2302,Go=2303,Vo=2400,Ho=2401,Wo=2402;var Wc=3200;var to=0,Xc=1,Pn="",zt="srgb",fs="srgb-linear",ps="linear",at="srgb";var Ia=7680;var qc=519,$c=512,Yc=513,Zc=514,no=515,Jc=516,Kc=517,io=518,jc=519,Qc=35044;var yl="300 es",dn=2e3,Pi=2001;function zd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Gd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function ms(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ed(){let i=ms("canvas");return i.style.display="block",i}var Yl={},Li=null;function bl(...i){let e="THREE."+i.shift();Li?Li("log",e,...i):console.log(e,...i)}function td(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function De(...i){i=td(i);let e="THREE."+i.shift();if(Li)Li("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Fe(...i){i=td(i);let e="THREE."+i.shift();if(Li)Li("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function ai(...i){let e=i.join(" ");e in Yl||(Yl[e]=!0,De(...i))}function nd(i,e,t){return new Promise(function(n,s){function a(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:n()}}setTimeout(a,t)})}var id={[Pa]:La,[Da]:Oa,[Ua]:Ba,[Ii]:Fa,[La]:Pa,[Oa]:Da,[Ba]:Ua,[Fa]:Ii},yn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let a=s.indexOf(t);a!==-1&&s.splice(a,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,e);e.target=null}}},Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var mo=Math.PI/180,Va=180/Math.PI;function ji(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]).toLowerCase()}function $e(i,e,t){return Math.max(e,Math.min(t,i))}function Vd(i,e){return(i%e+e)%e}function go(i,e,t){return(1-t)*i+t*e}function ss(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Vt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Al=class Al{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),a=this.x-e.x,r=this.y-e.y;return this.x=a*n-r*s+e.x,this.y=a*s+r*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Al.prototype.isVector2=!0;var xe=Al,bn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,a,r,o){let l=n[s+0],c=n[s+1],u=n[s+2],p=n[s+3],f=a[r+0],h=a[r+1],g=a[r+2],T=a[r+3];if(p!==T||l!==f||c!==h||u!==g){let m=l*f+c*h+u*g+p*T;m<0&&(f=-f,h=-h,g=-g,T=-T,m=-m);let d=1-o;if(m<.9995){let w=Math.acos(m),C=Math.sin(w);d=Math.sin(d*w)/C,o=Math.sin(o*w)/C,l=l*d+f*o,c=c*d+h*o,u=u*d+g*o,p=p*d+T*o}else{l=l*d+f*o,c=c*d+h*o,u=u*d+g*o,p=p*d+T*o;let w=1/Math.sqrt(l*l+c*c+u*u+p*p);l*=w,c*=w,u*=w,p*=w}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,s,a,r){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],p=a[r],f=a[r+1],h=a[r+2],g=a[r+3];return e[t]=o*g+u*p+l*h-c*f,e[t+1]=l*g+u*f+c*p-o*h,e[t+2]=c*g+u*h+o*f-l*p,e[t+3]=u*g-o*p-l*f-c*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,a=e._z,r=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),p=o(a/2),f=l(n/2),h=l(s/2),g=l(a/2);switch(r){case"XYZ":this._x=f*u*p+c*h*g,this._y=c*h*p-f*u*g,this._z=c*u*g+f*h*p,this._w=c*u*p-f*h*g;break;case"YXZ":this._x=f*u*p+c*h*g,this._y=c*h*p-f*u*g,this._z=c*u*g-f*h*p,this._w=c*u*p+f*h*g;break;case"ZXY":this._x=f*u*p-c*h*g,this._y=c*h*p+f*u*g,this._z=c*u*g+f*h*p,this._w=c*u*p-f*h*g;break;case"ZYX":this._x=f*u*p-c*h*g,this._y=c*h*p+f*u*g,this._z=c*u*g-f*h*p,this._w=c*u*p+f*h*g;break;case"YZX":this._x=f*u*p+c*h*g,this._y=c*h*p+f*u*g,this._z=c*u*g-f*h*p,this._w=c*u*p-f*h*g;break;case"XZY":this._x=f*u*p-c*h*g,this._y=c*h*p-f*u*g,this._z=c*u*g+f*h*p,this._w=c*u*p+f*h*g;break;default:De("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],a=t[8],r=t[1],o=t[5],l=t[9],c=t[2],u=t[6],p=t[10],f=n+o+p;if(f>0){let h=.5/Math.sqrt(f+1);this._w=.25/h,this._x=(u-l)*h,this._y=(a-c)*h,this._z=(r-s)*h}else if(n>o&&n>p){let h=2*Math.sqrt(1+n-o-p);this._w=(u-l)/h,this._x=.25*h,this._y=(s+r)/h,this._z=(a+c)/h}else if(o>p){let h=2*Math.sqrt(1+o-n-p);this._w=(a-c)/h,this._x=(s+r)/h,this._y=.25*h,this._z=(l+u)/h}else{let h=2*Math.sqrt(1+p-n-o);this._w=(r-s)/h,this._x=(a+c)/h,this._y=(l+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($e(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,a=e._z,r=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+r*o+s*c-a*l,this._y=s*u+r*l+a*o-n*c,this._z=a*u+r*c+n*l-s*o,this._w=r*u-n*o-s*l-a*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,a=e._z,r=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,a=-a,r=-r,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+a*t,this._w=this._w*l+r*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+a*t,this._w=this._w*l+r*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),a=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Cl=class Cl{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zl.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[3]*n+a[6]*s,this.y=a[1]*t+a[4]*n+a[7]*s,this.z=a[2]*t+a[5]*n+a[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,a=e.elements,r=1/(a[3]*t+a[7]*n+a[11]*s+a[15]);return this.x=(a[0]*t+a[4]*n+a[8]*s+a[12])*r,this.y=(a[1]*t+a[5]*n+a[9]*s+a[13])*r,this.z=(a[2]*t+a[6]*n+a[10]*s+a[14])*r,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,a=e.x,r=e.y,o=e.z,l=e.w,c=2*(r*s-o*n),u=2*(o*t-a*s),p=2*(a*n-r*t);return this.x=t+l*c+r*p-o*u,this.y=n+l*u+o*c-a*p,this.z=s+l*p+a*u-r*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s,this.y=a[1]*t+a[5]*n+a[9]*s,this.z=a[2]*t+a[6]*n+a[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,a=e.z,r=t.x,o=t.y,l=t.z;return this.x=s*l-a*o,this.y=a*r-n*l,this.z=n*o-s*r,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return xo.copy(this).projectOnVector(e),this.sub(xo)}reflect(e){return this.sub(xo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Cl.prototype.isVector3=!0;var k=Cl,xo=new k,Zl=new bn,Rl=class Rl{constructor(e,t,n,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,a,r,o,l,c)}set(e,t,n,s,a,r,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=a,u[5]=l,u[6]=n,u[7]=r,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,a=this.elements,r=n[0],o=n[3],l=n[6],c=n[1],u=n[4],p=n[7],f=n[2],h=n[5],g=n[8],T=s[0],m=s[3],d=s[6],w=s[1],C=s[4],_=s[7],b=s[2],y=s[5],M=s[8];return a[0]=r*T+o*w+l*b,a[3]=r*m+o*C+l*y,a[6]=r*d+o*_+l*M,a[1]=c*T+u*w+p*b,a[4]=c*m+u*C+p*y,a[7]=c*d+u*_+p*M,a[2]=f*T+h*w+g*b,a[5]=f*m+h*C+g*y,a[8]=f*d+h*_+g*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],r=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*r*u-t*o*c-n*a*u+n*o*l+s*a*c-s*r*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],r=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=u*r-o*c,f=o*l-u*a,h=c*a-r*l,g=t*p+n*f+s*h;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let T=1/g;return e[0]=p*T,e[1]=(s*c-u*n)*T,e[2]=(o*n-s*r)*T,e[3]=f*T,e[4]=(u*t-s*l)*T,e[5]=(s*a-o*t)*T,e[6]=h*T,e[7]=(n*l-c*t)*T,e[8]=(r*t-n*a)*T,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(n*l,n*c,-n*(l*r+c*o)+r+e,-s*c,s*l,-s*(-c*r+l*o)+o+t,0,0,1),this}scale(e,t){return ai("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(vo.makeScale(e,t)),this}rotate(e){return ai("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(vo.makeRotation(-e)),this}translate(e,t){return ai("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(vo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Rl.prototype.isMatrix3=!0;var ke=Rl,vo=new ke,Jl=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Kl=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Hd(){let i={enabled:!0,workingColorSpace:fs,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===at&&(s.r=Nn(s.r),s.g=Nn(s.g),s.b=Nn(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===at&&(s.r=Ri(s.r),s.g=Ri(s.g),s.b=Ri(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Pn?ps:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return ai("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return ai("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,a)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[fs]:{primaries:e,whitePoint:n,transfer:ps,toXYZ:Jl,fromXYZ:Kl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:zt},outputColorSpaceConfig:{drawingBufferColorSpace:zt}},[zt]:{primaries:e,whitePoint:n,transfer:at,toXYZ:Jl,fromXYZ:Kl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:zt}}}),i}var Ke=Hd();function Nn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ri(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var gi,Ha=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{gi===void 0&&(gi=ms("canvas")),gi.width=e.width,gi.height=e.height;let s=gi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=gi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ms("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=Nn(a[r]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Nn(t[n]/255)*255):t[n]=Nn(t[n]);return{data:t,width:e.width,height:e.height}}else return De("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Wd=0,Di=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=ji(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(_o(s[r].image)):a.push(_o(s[r]))}else a=_o(s);n.url=a}return t||(e.images[this.uuid]=n),n}};function _o(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ha.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(De("Texture: Unable to serialize Texture."),{})}var Xd=0,yo=new k,Ht=class i extends yn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=vn,s=vn,a=Nt,r=Jn,o=an,l=qt,c=i.DEFAULT_ANISOTROPY,u=Pn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=ji(),this.name="",this.source=new Di(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new xe(0,0),this.repeat=new xe(1,1),this.center=new xe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(yo).x}get height(){return this.source.getSize(yo).y}get depth(){return this.source.getSize(yo).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){De(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){De(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ul)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ka:e.x=e.x-Math.floor(e.x);break;case vn:e.x=e.x<0?0:1;break;case za:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ka:e.y=e.y-Math.floor(e.y);break;case vn:e.y=e.y<0?0:1;break;case za:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ht.DEFAULT_IMAGE=null;Ht.DEFAULT_MAPPING=ul;Ht.DEFAULT_ANISOTROPY=1;var Nl=class Nl{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,a=this.w,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s+r[12]*a,this.y=r[1]*t+r[5]*n+r[9]*s+r[13]*a,this.z=r[2]*t+r[6]*n+r[10]*s+r[14]*a,this.w=r[3]*t+r[7]*n+r[11]*s+r[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,a,l=e.elements,c=l[0],u=l[4],p=l[8],f=l[1],h=l[5],g=l[9],T=l[2],m=l[6],d=l[10];if(Math.abs(u-f)<.01&&Math.abs(p-T)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(p+T)<.1&&Math.abs(g+m)<.1&&Math.abs(c+h+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let C=(c+1)/2,_=(h+1)/2,b=(d+1)/2,y=(u+f)/4,M=(p+T)/4,x=(g+m)/4;return C>_&&C>b?C<.01?(n=0,s=.707106781,a=.707106781):(n=Math.sqrt(C),s=y/n,a=M/n):_>b?_<.01?(n=.707106781,s=0,a=.707106781):(s=Math.sqrt(_),n=y/s,a=x/s):b<.01?(n=.707106781,s=.707106781,a=0):(a=Math.sqrt(b),n=M/a,s=x/a),this.set(n,s,a,t),this}let w=Math.sqrt((m-g)*(m-g)+(p-T)*(p-T)+(f-u)*(f-u));return Math.abs(w)<.001&&(w=1),this.x=(m-g)/w,this.y=(p-T)/w,this.z=(f-u)/w,this.w=Math.acos((c+h+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this.w=$e(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this.w=$e(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Nl.prototype.isVector4=!0;var xt=Nl,Wa=class extends yn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Nt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},a=new Ht(s),r=n.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Nt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Di(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Wt=class extends Wa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},gs=class extends Ht{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Xa=class extends Ht{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var pr=class pr{constructor(e,t,n,s,a,r,o,l,c,u,p,f,h,g,T,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,a,r,o,l,c,u,p,f,h,g,T,m)}set(e,t,n,s,a,r,o,l,c,u,p,f,h,g,T,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=a,d[5]=r,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=p,d[14]=f,d[3]=h,d[7]=g,d[11]=T,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new pr().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/xi.setFromMatrixColumn(e,0).length(),a=1/xi.setFromMatrixColumn(e,1).length(),r=1/xi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=0,t[8]=n[8]*r,t[9]=n[9]*r,t[10]=n[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,a=e.z,r=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(a),p=Math.sin(a);if(e.order==="XYZ"){let f=r*u,h=r*p,g=o*u,T=o*p;t[0]=l*u,t[4]=-l*p,t[8]=c,t[1]=h+g*c,t[5]=f-T*c,t[9]=-o*l,t[2]=T-f*c,t[6]=g+h*c,t[10]=r*l}else if(e.order==="YXZ"){let f=l*u,h=l*p,g=c*u,T=c*p;t[0]=f+T*o,t[4]=g*o-h,t[8]=r*c,t[1]=r*p,t[5]=r*u,t[9]=-o,t[2]=h*o-g,t[6]=T+f*o,t[10]=r*l}else if(e.order==="ZXY"){let f=l*u,h=l*p,g=c*u,T=c*p;t[0]=f-T*o,t[4]=-r*p,t[8]=g+h*o,t[1]=h+g*o,t[5]=r*u,t[9]=T-f*o,t[2]=-r*c,t[6]=o,t[10]=r*l}else if(e.order==="ZYX"){let f=r*u,h=r*p,g=o*u,T=o*p;t[0]=l*u,t[4]=g*c-h,t[8]=f*c+T,t[1]=l*p,t[5]=T*c+f,t[9]=h*c-g,t[2]=-c,t[6]=o*l,t[10]=r*l}else if(e.order==="YZX"){let f=r*l,h=r*c,g=o*l,T=o*c;t[0]=l*u,t[4]=T-f*p,t[8]=g*p+h,t[1]=p,t[5]=r*u,t[9]=-o*u,t[2]=-c*u,t[6]=h*p+g,t[10]=f-T*p}else if(e.order==="XZY"){let f=r*l,h=r*c,g=o*l,T=o*c;t[0]=l*u,t[4]=-p,t[8]=c*u,t[1]=f*p+T,t[5]=r*u,t[9]=h*p-g,t[2]=g*p-h,t[6]=o*u,t[10]=T*p+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qd,e,$d)}lookAt(e,t,n){let s=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),Fn.crossVectors(n,Zt),Fn.lengthSq()===0&&(Math.abs(n.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),Fn.crossVectors(n,Zt)),Fn.normalize(),ca.crossVectors(Zt,Fn),s[0]=Fn.x,s[4]=ca.x,s[8]=Zt.x,s[1]=Fn.y,s[5]=ca.y,s[9]=Zt.y,s[2]=Fn.z,s[6]=ca.z,s[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,a=this.elements,r=n[0],o=n[4],l=n[8],c=n[12],u=n[1],p=n[5],f=n[9],h=n[13],g=n[2],T=n[6],m=n[10],d=n[14],w=n[3],C=n[7],_=n[11],b=n[15],y=s[0],M=s[4],x=s[8],E=s[12],R=s[1],I=s[5],N=s[9],O=s[13],A=s[2],D=s[6],L=s[10],V=s[14],X=s[3],H=s[7],U=s[11],J=s[15];return a[0]=r*y+o*R+l*A+c*X,a[4]=r*M+o*I+l*D+c*H,a[8]=r*x+o*N+l*L+c*U,a[12]=r*E+o*O+l*V+c*J,a[1]=u*y+p*R+f*A+h*X,a[5]=u*M+p*I+f*D+h*H,a[9]=u*x+p*N+f*L+h*U,a[13]=u*E+p*O+f*V+h*J,a[2]=g*y+T*R+m*A+d*X,a[6]=g*M+T*I+m*D+d*H,a[10]=g*x+T*N+m*L+d*U,a[14]=g*E+T*O+m*V+d*J,a[3]=w*y+C*R+_*A+b*X,a[7]=w*M+C*I+_*D+b*H,a[11]=w*x+C*N+_*L+b*U,a[15]=w*E+C*O+_*V+b*J,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],a=e[12],r=e[1],o=e[5],l=e[9],c=e[13],u=e[2],p=e[6],f=e[10],h=e[14],g=e[3],T=e[7],m=e[11],d=e[15],w=l*h-c*f,C=o*h-c*p,_=o*f-l*p,b=r*h-c*u,y=r*f-l*u,M=r*p-o*u;return t*(T*w-m*C+d*_)-n*(g*w-m*b+d*y)+s*(g*C-T*b+d*M)-a*(g*_-T*y+m*M)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],a=e[1],r=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(r*u-o*c)-n*(a*u-o*l)+s*(a*c-r*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],r=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=e[9],f=e[10],h=e[11],g=e[12],T=e[13],m=e[14],d=e[15],w=t*o-n*r,C=t*l-s*r,_=t*c-a*r,b=n*l-s*o,y=n*c-a*o,M=s*c-a*l,x=u*T-p*g,E=u*m-f*g,R=u*d-h*g,I=p*m-f*T,N=p*d-h*T,O=f*d-h*m,A=w*O-C*N+_*I+b*R-y*E+M*x;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/A;return e[0]=(o*O-l*N+c*I)*D,e[1]=(s*N-n*O-a*I)*D,e[2]=(T*M-m*y+d*b)*D,e[3]=(f*y-p*M-h*b)*D,e[4]=(l*R-r*O-c*E)*D,e[5]=(t*O-s*R+a*E)*D,e[6]=(m*_-g*M-d*C)*D,e[7]=(u*M-f*_+h*C)*D,e[8]=(r*N-o*R+c*x)*D,e[9]=(n*R-t*N-a*x)*D,e[10]=(g*y-T*_+d*w)*D,e[11]=(p*_-u*y-h*w)*D,e[12]=(o*E-r*I-l*x)*D,e[13]=(t*I-n*E+s*x)*D,e[14]=(T*C-g*b-m*w)*D,e[15]=(u*b-p*C+f*w)*D,this}scale(e){let t=this.elements,n=e.x,s=e.y,a=e.z;return t[0]*=n,t[4]*=s,t[8]*=a,t[1]*=n,t[5]*=s,t[9]*=a,t[2]*=n,t[6]*=s,t[10]*=a,t[3]*=n,t[7]*=s,t[11]*=a,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),a=1-n,r=e.x,o=e.y,l=e.z,c=a*r,u=a*o;return this.set(c*r+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*r,0,c*l-s*o,u*l+s*r,a*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,a,r){return this.set(1,n,a,0,e,1,r,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,a=t._x,r=t._y,o=t._z,l=t._w,c=a+a,u=r+r,p=o+o,f=a*c,h=a*u,g=a*p,T=r*u,m=r*p,d=o*p,w=l*c,C=l*u,_=l*p,b=n.x,y=n.y,M=n.z;return s[0]=(1-(T+d))*b,s[1]=(h+_)*b,s[2]=(g-C)*b,s[3]=0,s[4]=(h-_)*y,s[5]=(1-(f+d))*y,s[6]=(m+w)*y,s[7]=0,s[8]=(g+C)*M,s[9]=(m-w)*M,s[10]=(1-(f+T))*M,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let a=this.determinantAffine();if(a===0)return n.set(1,1,1),t.identity(),this;let r=xi.set(s[0],s[1],s[2]).length(),o=xi.set(s[4],s[5],s[6]).length(),l=xi.set(s[8],s[9],s[10]).length();a<0&&(r=-r),rn.copy(this);let c=1/r,u=1/o,p=1/l;return rn.elements[0]*=c,rn.elements[1]*=c,rn.elements[2]*=c,rn.elements[4]*=u,rn.elements[5]*=u,rn.elements[6]*=u,rn.elements[8]*=p,rn.elements[9]*=p,rn.elements[10]*=p,t.setFromRotationMatrix(rn),n.x=r,n.y=o,n.z=l,this}makePerspective(e,t,n,s,a,r,o=dn,l=!1){let c=this.elements,u=2*a/(t-e),p=2*a/(n-s),f=(t+e)/(t-e),h=(n+s)/(n-s),g,T;if(l)g=a/(r-a),T=r*a/(r-a);else if(o===dn)g=-(r+a)/(r-a),T=-2*r*a/(r-a);else if(o===Pi)g=-r/(r-a),T=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=p,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=T,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,a,r,o=dn,l=!1){let c=this.elements,u=2/(t-e),p=2/(n-s),f=-(t+e)/(t-e),h=-(n+s)/(n-s),g,T;if(l)g=1/(r-a),T=r/(r-a);else if(o===dn)g=-2/(r-a),T=-(r+a)/(r-a);else if(o===Pi)g=-1/(r-a),T=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=p,c[9]=0,c[13]=h,c[2]=0,c[6]=0,c[10]=g,c[14]=T,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};pr.prototype.isMatrix4=!0;var gt=pr,xi=new k,rn=new gt,qd=new k(0,0,0),$d=new k(1,1,1),Fn=new k,ca=new k,Zt=new k,jl=new gt,Ql=new bn,In=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],u=s[9],p=s[2],f=s[6],h=s[10];switch(t){case"XYZ":this._y=Math.asin($e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,h),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,h),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin($e(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-p,h),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-$e(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(f,h),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,h));break;case"XZY":this._z=Math.asin(-$e(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-u,h),this._y=0);break;default:De("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return jl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ql.setFromEuler(this),this.setFromQuaternion(Ql,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};In.DEFAULT_ORDER="XYZ";var xs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Yd=0,ec=new k,vi=new bn,Tn=new gt,da=new k,as=new k,Zd=new k,Jd=new bn,tc=new k(1,0,0),nc=new k(0,1,0),ic=new k(0,0,1),sc={type:"added"},Kd={type:"removed"},_i={type:"childadded",child:null},bo={type:"childremoved",child:null},Ut=class i extends yn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new k,t=new In,n=new bn,s=new k(1,1,1);function a(){n.setFromEuler(t,!1)}function r(){t.setFromQuaternion(n,void 0,!1)}t._onChange(a),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new gt},normalMatrix:{value:new ke}}),this.matrix=new gt,this.matrixWorld=new gt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.multiply(vi),this}rotateOnWorldAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.premultiply(vi),this}rotateX(e){return this.rotateOnAxis(tc,e)}rotateY(e){return this.rotateOnAxis(nc,e)}rotateZ(e){return this.rotateOnAxis(ic,e)}translateOnAxis(e,t){return ec.copy(e).applyQuaternion(this.quaternion),this.position.add(ec.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tc,e)}translateY(e){return this.translateOnAxis(nc,e)}translateZ(e){return this.translateOnAxis(ic,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?da.copy(e):da.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),as.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tn.lookAt(as,da,this.up):Tn.lookAt(da,as,this.up),this.quaternion.setFromRotationMatrix(Tn),s&&(Tn.extractRotation(s.matrixWorld),vi.setFromRotationMatrix(Tn),this.quaternion.premultiply(vi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Fe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(sc),_i.child=e,this.dispatchEvent(_i),_i.child=null):Fe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kd),bo.child=e,this.dispatchEvent(bo),bo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Tn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Tn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(sc),_i.child=e,this.dispatchEvent(_i),_i.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(as,e,Zd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(as,Jd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,a=this.matrix.elements;a[12]+=t-a[0]*t-a[4]*n-a[8]*s,a[13]+=n-a[1]*t-a[5]*n-a[9]*s,a[14]+=s-a[2]*t-a[6]*n-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let p=l[c];a(e.shapes,p)}else a(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(e.materials,this.material[l]));s.material=o}else s.material=a(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(e.animations,l))}}if(t){let o=r(e.geometries),l=r(e.materials),c=r(e.textures),u=r(e.images),p=r(e.shapes),f=r(e.skeletons),h=r(e.animations),g=r(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),p.length>0&&(n.shapes=p),f.length>0&&(n.skeletons=f),h.length>0&&(n.animations=h),g.length>0&&(n.nodes=g)}return n.object=s,n;function r(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ut.DEFAULT_UP=new k(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var nn=class extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},jd={type:"move"},Ui=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new nn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new nn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new nn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){r=!0;for(let T of e.hand.values()){let m=t.getJointPose(T,n),d=this._getHandJoint(c,T);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let u=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],f=u.position.distanceTo(p.position),h=.02,g=.005;c.inputState.pinching&&f>h+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=h-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,n),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(jd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new nn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},sd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},ha={h:0,s:0,l:0};function So(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ye=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ke.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ke.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ke.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ke.workingColorSpace){if(e=Vd(e,1),t=$e(t,0,1),n=$e(n,0,1),t===0)this.r=this.g=this.b=n;else{let a=n<=.5?n*(1+t):n+t-n*t,r=2*n-a;this.r=So(r,a,e+1/3),this.g=So(r,a,e),this.b=So(r,a,e-1/3)}return Ke.colorSpaceToWorking(this,s),this}setStyle(e,t=zt){function n(a){a!==void 0&&parseFloat(a)<1&&De("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:De("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(r===6)return this.setHex(parseInt(a,16),t);De("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zt){let n=sd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):De("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Nn(e.r),this.g=Nn(e.g),this.b=Nn(e.b),this}copyLinearToSRGB(e){return this.r=Ri(e.r),this.g=Ri(e.g),this.b=Ri(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zt){return Ke.workingToColorSpace(Dt.copy(this),e),Math.round($e(Dt.r*255,0,255))*65536+Math.round($e(Dt.g*255,0,255))*256+Math.round($e(Dt.b*255,0,255))}getHexString(e=zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ke.workingColorSpace){Ke.workingToColorSpace(Dt.copy(this),t);let n=Dt.r,s=Dt.g,a=Dt.b,r=Math.max(n,s,a),o=Math.min(n,s,a),l,c,u=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=u<=.5?p/(r+o):p/(2-r-o),r){case n:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-n)/p+2;break;case a:l=(n-s)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ke.workingColorSpace){return Ke.workingToColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=zt){Ke.workingToColorSpace(Dt.copy(this),e);let t=Dt.r,n=Dt.g,s=Dt.b;return e!==zt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(On),this.setHSL(On.h+e,On.s+t,On.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(On),e.getHSL(ha);let n=go(On.h,ha.h,t),s=go(On.s,ha.s,t),a=go(On.l,ha.l,t);return this.setHSL(n,s,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,a=e.elements;return this.r=a[0]*t+a[3]*n+a[6]*s,this.g=a[1]*t+a[4]*n+a[7]*s,this.b=a[2]*t+a[5]*n+a[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Dt=new Ye;Ye.NAMES=sd;var vs=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ye(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var _s=class extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new In,this.environmentIntensity=1,this.environmentRotation=new In,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},on=new k,En=new k,Mo=new k,An=new k,yi=new k,bi=new k,ac=new k,wo=new k,To=new k,Eo=new k,Ao=new xt,Co=new xt,Ro=new xt,Gn=class i{constructor(e=new k,t=new k,n=new k){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),on.subVectors(e,t),s.cross(on);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(e,t,n,s,a){on.subVectors(s,t),En.subVectors(n,t),Mo.subVectors(e,t);let r=on.dot(on),o=on.dot(En),l=on.dot(Mo),c=En.dot(En),u=En.dot(Mo),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let f=1/p,h=(c*l-o*u)*f,g=(r*u-o*l)*f;return a.set(1-h-g,g,h)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,An)===null?!1:An.x>=0&&An.y>=0&&An.x+An.y<=1}static getInterpolation(e,t,n,s,a,r,o,l){return this.getBarycoord(e,t,n,s,An)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,An.x),l.addScaledVector(r,An.y),l.addScaledVector(o,An.z),l)}static getInterpolatedAttribute(e,t,n,s,a,r){return Ao.setScalar(0),Co.setScalar(0),Ro.setScalar(0),Ao.fromBufferAttribute(e,t),Co.fromBufferAttribute(e,n),Ro.fromBufferAttribute(e,s),r.setScalar(0),r.addScaledVector(Ao,a.x),r.addScaledVector(Co,a.y),r.addScaledVector(Ro,a.z),r}static isFrontFacing(e,t,n,s){return on.subVectors(n,t),En.subVectors(e,t),on.cross(En).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return on.subVectors(this.c,this.b),En.subVectors(this.a,this.b),on.cross(En).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,a){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,a)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,a=this.c,r,o;yi.subVectors(s,n),bi.subVectors(a,n),wo.subVectors(e,n);let l=yi.dot(wo),c=bi.dot(wo);if(l<=0&&c<=0)return t.copy(n);To.subVectors(e,s);let u=yi.dot(To),p=bi.dot(To);if(u>=0&&p<=u)return t.copy(s);let f=l*p-u*c;if(f<=0&&l>=0&&u<=0)return r=l/(l-u),t.copy(n).addScaledVector(yi,r);Eo.subVectors(e,a);let h=yi.dot(Eo),g=bi.dot(Eo);if(g>=0&&h<=g)return t.copy(a);let T=h*c-l*g;if(T<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(bi,o);let m=u*g-h*p;if(m<=0&&p-u>=0&&h-g>=0)return ac.subVectors(a,s),o=(p-u)/(p-u+(h-g)),t.copy(s).addScaledVector(ac,o);let d=1/(m+T+f);return r=T*d,o=f*d,t.copy(n).addScaledVector(yi,r).addScaledVector(bi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Vn=class{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(ln.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(ln.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=ln.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let a=n.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)e.isMesh===!0?e.getVertexPosition(r,ln):ln.fromBufferAttribute(a,r),ln.applyMatrix4(e.matrixWorld),this.expandByPoint(ln);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ua.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ua.copy(n.boundingBox)),ua.applyMatrix4(e.matrixWorld),this.union(ua)}let s=e.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ln),ln.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(rs),fa.subVectors(this.max,rs),Si.subVectors(e.a,rs),Mi.subVectors(e.b,rs),wi.subVectors(e.c,rs),Bn.subVectors(Mi,Si),kn.subVectors(wi,Mi),ti.subVectors(Si,wi);let t=[0,-Bn.z,Bn.y,0,-kn.z,kn.y,0,-ti.z,ti.y,Bn.z,0,-Bn.x,kn.z,0,-kn.x,ti.z,0,-ti.x,-Bn.y,Bn.x,0,-kn.y,kn.x,0,-ti.y,ti.x,0];return!No(t,Si,Mi,wi,fa)||(t=[1,0,0,0,1,0,0,0,1],!No(t,Si,Mi,wi,fa))?!1:(pa.crossVectors(Bn,kn),t=[pa.x,pa.y,pa.z],No(t,Si,Mi,wi,fa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ln).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ln).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Cn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Cn=[new k,new k,new k,new k,new k,new k,new k,new k],ln=new k,ua=new Vn,Si=new k,Mi=new k,wi=new k,Bn=new k,kn=new k,ti=new k,rs=new k,fa=new k,pa=new k,ni=new k;function No(i,e,t,n,s){for(let a=0,r=i.length-3;a<=r;a+=3){ni.fromArray(i,a);let o=s.x*Math.abs(ni.x)+s.y*Math.abs(ni.y)+s.z*Math.abs(ni.z),l=e.dot(ni),c=t.dot(ni),u=n.dot(ni);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Mt=new k,ma=new xe,Qd=0,sn=class extends yn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Qd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Qc,this.updateRanges=[],this.gpuType=fn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ma.fromBufferAttribute(this,t),ma.applyMatrix3(e),this.setXY(t,ma.x,ma.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ss(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Vt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ss(t,this.array)),t}setX(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ss(t,this.array)),t}setY(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ss(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ss(t,this.array)),t}setW(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),s=Vt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,a){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),s=Vt(s,this.array),a=Vt(a,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var ys=class extends sn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var bs=class extends sn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var rt=class extends sn{constructor(e,t,n){super(new Float32Array(e),t,n)}},eh=new Vn,os=new k,Io=new k,Fi=class{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):eh.setFromPoints(e).getCenter(n);let s=0;for(let a=0,r=e.length;a<r;a++)s=Math.max(s,n.distanceToSquared(e[a]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;os.subVectors(e,this.center);let t=os.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(os,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Io.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(os.copy(e.center).add(Io)),this.expandByPoint(os.copy(e.center).sub(Io))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},th=0,tn=new gt,Po=new Ut,Ti=new k,Jt=new Vn,ls=new Vn,At=new k,Ft=class i extends yn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:th++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(zd(e)?bs:ys)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let a=new ke().getNormalMatrix(e);n.applyNormalMatrix(a),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return Po.lookAt(e),Po.updateMatrix(),this.applyMatrix4(Po.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ti).negate(),this.translate(Ti.x,Ti.y,Ti.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,a=e.length;s<a;s++){let r=e[s];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new rt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let a=e[s];t.setXYZ(s,a.x,a.y,a.z||0)}e.length>t.count&&De("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Vn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let a=t[n];Jt.setFromBufferAttribute(a),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Fe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){let n=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let a=0,r=t.length;a<r;a++){let o=t[a];ls.setFromBufferAttribute(o),this.morphTargetsRelative?(At.addVectors(Jt.min,ls.min),Jt.expandByPoint(At),At.addVectors(Jt.max,ls.max),Jt.expandByPoint(At)):(Jt.expandByPoint(ls.min),Jt.expandByPoint(ls.max))}Jt.getCenter(n);let s=0;for(let a=0,r=e.count;a<r;a++)At.fromBufferAttribute(e,a),s=Math.max(s,n.distanceToSquared(At));if(t)for(let a=0,r=t.length;a<r;a++){let o=t[a],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)At.fromBufferAttribute(o,c),l&&(Ti.fromBufferAttribute(e,c),At.add(Ti)),s=Math.max(s,n.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Fe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Fe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,a=t.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==n.count)&&(r=new sn(new Float32Array(4*n.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new k,l[x]=new k;let c=new k,u=new k,p=new k,f=new xe,h=new xe,g=new xe,T=new k,m=new k;function d(x,E,R){c.fromBufferAttribute(n,x),u.fromBufferAttribute(n,E),p.fromBufferAttribute(n,R),f.fromBufferAttribute(a,x),h.fromBufferAttribute(a,E),g.fromBufferAttribute(a,R),u.sub(c),p.sub(c),h.sub(f),g.sub(f);let I=1/(h.x*g.y-g.x*h.y);isFinite(I)&&(T.copy(u).multiplyScalar(g.y).addScaledVector(p,-h.y).multiplyScalar(I),m.copy(p).multiplyScalar(h.x).addScaledVector(u,-g.x).multiplyScalar(I),o[x].add(T),o[E].add(T),o[R].add(T),l[x].add(m),l[E].add(m),l[R].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let x=0,E=w.length;x<E;++x){let R=w[x],I=R.start,N=R.count;for(let O=I,A=I+N;O<A;O+=3)d(e.getX(O+0),e.getX(O+1),e.getX(O+2))}let C=new k,_=new k,b=new k,y=new k;function M(x){b.fromBufferAttribute(s,x),y.copy(b);let E=o[x];C.copy(E),C.sub(b.multiplyScalar(b.dot(E))).normalize(),_.crossVectors(y,E);let I=_.dot(l[x])<0?-1:1;r.setXYZW(x,C.x,C.y,C.z,I)}for(let x=0,E=w.length;x<E;++x){let R=w[x],I=R.start,N=R.count;for(let O=I,A=I+N;O<A;O+=3)M(e.getX(O+0)),M(e.getX(O+1)),M(e.getX(O+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new sn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,h=n.count;f<h;f++)n.setXYZ(f,0,0,0);let s=new k,a=new k,r=new k,o=new k,l=new k,c=new k,u=new k,p=new k;if(e)for(let f=0,h=e.count;f<h;f+=3){let g=e.getX(f+0),T=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),a.fromBufferAttribute(t,T),r.fromBufferAttribute(t,m),u.subVectors(r,a),p.subVectors(s,a),u.cross(p),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,T),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(T,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,h=t.count;f<h;f+=3)s.fromBufferAttribute(t,f+0),a.fromBufferAttribute(t,f+1),r.fromBufferAttribute(t,f+2),u.subVectors(r,a),p.subVectors(s,a),u.cross(p),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,p=o.normalized,f=new c.constructor(l.length*u),h=0,g=0;for(let T=0,m=l.length;T<m;T++){o.isInterleavedBufferAttribute?h=l[T]*o.data.stride+o.offset:h=l[T]*u;for(let d=0;d<u;d++)f[g++]=c[h++]}return new sn(f,u,p)}if(this.index===null)return De("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let u=0,p=c.length;u<p;u++){let f=c[u],h=e(f,n);l.push(h)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let p=0,f=c.length;p<f;p++){let h=c[p];u.push(h.toJSON(e.data))}u.length>0&&(s[l]=u,a=!0)}a&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(e.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let a=e.morphAttributes;for(let c in a){let u=[],p=a[c];for(let f=0,h=p.length;f<h;f++)u.push(p[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let r=e.groups;for(let c=0,u=r.length;c<u;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Lo=new k,nh=new k,ih=new ke,cn=class{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Lo.subVectors(n,t).cross(nh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Lo),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/a;return n===!0&&(r<0||r>1)?null:t.copy(e.start).addScaledVector(s,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ih.getNormalMatrix(e),s=this.coplanarPoint(Lo).applyMatrix4(e),a=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},sh=0,Hn=class extends yn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:sh++}),this.uuid=ji(),this.name="",this.type="Material",this.blending=Zi,this.side=Yn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=il,this.blendDst=sl,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=Ii,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ia,this.stencilZFail=Ia,this.stencilZPass=Ia,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){De(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){De(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(t){let a=s(e.textures),r=s(e.images);a.length>0&&(n.textures=a),r.length>0&&(n.images=r)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ye().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new cn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new xe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new xe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let a=0;a!==s;++a)n[a]=t[a].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Rn=new k,Do=new k,ga=new k,xa=new k,qa=class{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Rn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Rn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Rn.copy(this.origin).addScaledVector(this.direction,t),Rn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Do.copy(e).add(t).multiplyScalar(.5),ga.copy(t).sub(e).normalize(),xa.copy(this.origin).sub(Do);let a=e.distanceTo(t)*.5,r=-this.direction.dot(ga),o=xa.dot(this.direction),l=-xa.dot(ga),c=xa.lengthSq(),u=Math.abs(1-r*r),p,f,h,g;if(u>0)if(p=r*l-o,f=r*o-l,g=a*u,p>=0)if(f>=-g)if(f<=g){let T=1/u;p*=T,f*=T,h=p*(p+r*f+2*o)+f*(r*p+f+2*l)+c}else f=a,p=Math.max(0,-(r*f+o)),h=-p*p+f*(f+2*l)+c;else f=-a,p=Math.max(0,-(r*f+o)),h=-p*p+f*(f+2*l)+c;else f<=-g?(p=Math.max(0,-(-r*a+o)),f=p>0?-a:Math.min(Math.max(-a,-l),a),h=-p*p+f*(f+2*l)+c):f<=g?(p=0,f=Math.min(Math.max(-a,-l),a),h=f*(f+2*l)+c):(p=Math.max(0,-(r*a+o)),f=p>0?a:Math.min(Math.max(-a,-l),a),h=-p*p+f*(f+2*l)+c);else f=r>0?-a:a,p=Math.max(0,-(r*f+o)),h=-p*p+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Do).addScaledVector(ga,f),h}intersectSphere(e,t){if(e.radius<0)return null;Rn.subVectors(e.center,this.origin);let n=Rn.dot(this.direction),s=Rn.dot(Rn)-n*n,a=e.radius*e.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=n-r,l=n+r;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,a,r,o,l,c=1/this.direction.x,u=1/this.direction.y,p=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),u>=0?(a=(e.min.y-f.y)*u,r=(e.max.y-f.y)*u):(a=(e.max.y-f.y)*u,r=(e.min.y-f.y)*u),n>r||a>s||((a>n||isNaN(n))&&(n=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(e.min.z-f.z)*p,l=(e.max.z-f.z)*p):(o=(e.max.z-f.z)*p,l=(e.min.z-f.z)*p),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Rn)!==null}intersectTriangle(e,t,n,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,p=e.x-r.x,f=e.y-r.y,h=e.z-r.z,g=t.x-r.x,T=t.y-r.y,m=t.z-r.z,d=n.x-r.x,w=n.y-r.y,C=n.z-r.z,_=Math.abs(l),b=Math.abs(c),y=Math.abs(u),M,x,E,R,I,N,O,A,D,L,V,X;if(_>=b&&_>=y?(E=l,N=p,D=g,X=d,l>=0?(M=c,x=u,R=f,I=h,O=T,A=m,L=w,V=C):(M=u,x=c,R=h,I=f,O=m,A=T,L=C,V=w)):b>=y?(E=c,N=f,D=T,X=w,c>=0?(M=u,x=l,R=h,I=p,O=m,A=g,L=C,V=d):(M=l,x=u,R=p,I=h,O=g,A=m,L=d,V=C)):(E=u,N=h,D=m,X=C,u>=0?(M=l,x=c,R=p,I=f,O=g,A=T,L=d,V=w):(M=c,x=l,R=f,I=p,O=T,A=g,L=w,V=d)),E===0)return null;let H=M/E,U=x/E,J=1/E,Y=R-H*N,ae=I-U*N,Pe=O-H*D,Ee=A-U*D,we=L-H*X,K=V-U*X,j=we*Ee-K*Pe,ce=Y*K-ae*we,be=Pe*ae-Ee*Y;if(s){if(j<0||ce<0||be<0)return null}else if((j<0||ce<0||be<0)&&(j>0||ce>0||be>0))return null;let ge=j+ce+be;if(ge===0)return null;let Oe=J*(j*N+ce*D+be*X);return(ge>0?Oe<0:Oe>0)?null:this.at(Oe/ge,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ss=class extends Hn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.combine=al,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},rc=new gt,ii=new qa,va=new Fi,oc=new k,_a=new k,ya=new k,ba=new k,Uo=new k,Sa=new k,lc=new k,Ma=new k,Xt=class extends Ut{constructor(e=new Ft,t=new Ss){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,a=n.morphAttributes.position,r=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(a&&o){Sa.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let u=o[l],p=a[l];u!==0&&(Uo.fromBufferAttribute(p,e),r?Sa.addScaledVector(Uo,u):Sa.addScaledVector(Uo.sub(t),u))}t.add(Sa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),va.copy(n.boundingSphere),va.applyMatrix4(a),ii.copy(e.ray).recast(e.near),!(va.containsPoint(ii.origin)===!1&&(ii.intersectSphere(va,oc)===null||ii.origin.distanceToSquared(oc)>(e.far-e.near)**2))&&(rc.copy(a).invert(),ii.copy(e.ray).applyMatrix4(rc),!(n.boundingBox!==null&&ii.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ii)))}_computeIntersections(e,t,n){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,u=a.attributes.uv1,p=a.attributes.normal,f=a.groups,h=a.drawRange;if(o!==null)if(Array.isArray(r))for(let g=0,T=f.length;g<T;g++){let m=f[g],d=r[m.materialIndex],w=Math.max(m.start,h.start),C=Math.min(o.count,Math.min(m.start+m.count,h.start+h.count));for(let _=w,b=C;_<b;_+=3){let y=o.getX(_),M=o.getX(_+1),x=o.getX(_+2);s=wa(this,d,e,n,c,u,p,y,M,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,h.start),T=Math.min(o.count,h.start+h.count);for(let m=g,d=T;m<d;m+=3){let w=o.getX(m),C=o.getX(m+1),_=o.getX(m+2);s=wa(this,r,e,n,c,u,p,w,C,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let g=0,T=f.length;g<T;g++){let m=f[g],d=r[m.materialIndex],w=Math.max(m.start,h.start),C=Math.min(l.count,Math.min(m.start+m.count,h.start+h.count));for(let _=w,b=C;_<b;_+=3){let y=_,M=_+1,x=_+2;s=wa(this,d,e,n,c,u,p,y,M,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,h.start),T=Math.min(l.count,h.start+h.count);for(let m=g,d=T;m<d;m+=3){let w=m,C=m+1,_=m+2;s=wa(this,r,e,n,c,u,p,w,C,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function ah(i,e,t,n,s,a,r,o){let l;if(e.side===Gt?l=n.intersectTriangle(r,a,s,!0,o):l=n.intersectTriangle(s,a,r,e.side===Yn,o),l===null)return null;Ma.copy(o),Ma.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ma);return c<t.near||c>t.far?null:{distance:c,point:Ma.clone(),object:i}}function wa(i,e,t,n,s,a,r,o,l,c){i.getVertexPosition(o,_a),i.getVertexPosition(l,ya),i.getVertexPosition(c,ba);let u=ah(i,e,t,n,_a,ya,ba,lc);if(u){let p=new k;Gn.getBarycoord(lc,_a,ya,ba,p),s&&(u.uv=Gn.getInterpolatedAttribute(s,o,l,c,p,new xe)),a&&(u.uv1=Gn.getInterpolatedAttribute(a,o,l,c,p,new xe)),r&&(u.normal=Gn.getInterpolatedAttribute(r,o,l,c,p,new k),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a:o,b:l,c,normal:new k,materialIndex:0};Gn.getNormal(_a,ya,ba,f.normal),u.face=f,u.barycoord=p}return u}var $a=class extends Ht{constructor(e=null,t=1,n=1,s,a,r,o,l,c=Ct,u=Ct,p,f){super(null,r,o,l,c,u,s,a,p,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var si=new Fi,rh=new xe(.5,.5),Ta=new k,Oi=class{constructor(e=new cn,t=new cn,n=new cn,s=new cn,a=new cn,r=new cn){this.planes=[e,t,n,s,a,r]}set(e,t,n,s,a,r){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=dn,n=!1){let s=this.planes,a=e.elements,r=a[0],o=a[1],l=a[2],c=a[3],u=a[4],p=a[5],f=a[6],h=a[7],g=a[8],T=a[9],m=a[10],d=a[11],w=a[12],C=a[13],_=a[14],b=a[15];if(s[0].setComponents(c-r,h-u,d-g,b-w).normalize(),s[1].setComponents(c+r,h+u,d+g,b+w).normalize(),s[2].setComponents(c+o,h+p,d+T,b+C).normalize(),s[3].setComponents(c-o,h-p,d-T,b-C).normalize(),n)s[4].setComponents(l,f,m,_).normalize(),s[5].setComponents(c-l,h-f,d-m,b-_).normalize();else if(s[4].setComponents(c-l,h-f,d-m,b-_).normalize(),t===dn)s[5].setComponents(c+l,h+f,d+m,b+_).normalize();else if(t===Pi)s[5].setComponents(l,f,m,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),si.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),si.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(si)}intersectsSprite(e){si.center.set(0,0,0);let t=rh.distanceTo(e.center);return si.radius=.7071067811865476+t,si.applyMatrix4(e.matrixWorld),this.intersectsSphere(si)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Ta.x=s.normal.x>0?e.max.x:e.min.x,Ta.y=s.normal.y>0?e.max.y:e.min.y,Ta.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ta)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Ms=class extends Ht{constructor(e=[],t=Zn,n,s,a,r,o,l,c,u){super(e,t,n,s,a,r,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Wn=class extends Ht{constructor(e,t,n=un,s,a,r,o=Ct,l=Ct,c,u=_n,p=1){if(u!==_n&&u!==Kn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:p};super(f,s,a,r,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Di(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ya=class extends Wn{constructor(e,t=un,n=Zn,s,a,r=Ct,o=Ct,l,c=_n){let u={width:e,height:e,depth:1},p=[u,u,u,u,u,u];super(e,e,t,n,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ws=class extends Ht{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Bi=class i extends Ft{constructor(e=1,t=1,n=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],u=[],p=[],f=0,h=0;g("z","y","x",-1,-1,n,t,e,r,a,0),g("z","y","x",1,-1,n,t,-e,r,a,1),g("x","z","y",1,1,e,n,t,s,r,2),g("x","z","y",1,-1,e,n,-t,s,r,3),g("x","y","z",1,-1,e,t,n,s,a,4),g("x","y","z",-1,-1,e,t,-n,s,a,5),this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(p,2));function g(T,m,d,w,C,_,b,y,M,x,E){let R=_/M,I=b/x,N=_/2,O=b/2,A=y/2,D=M+1,L=x+1,V=0,X=0,H=new k;for(let U=0;U<L;U++){let J=U*I-O;for(let Y=0;Y<D;Y++){let ae=Y*R-N;H[T]=ae*w,H[m]=J*C,H[d]=A,c.push(H.x,H.y,H.z),H[T]=0,H[m]=0,H[d]=y>0?1:-1,u.push(H.x,H.y,H.z),p.push(Y/M),p.push(1-U/x),V+=1}}for(let U=0;U<x;U++)for(let J=0;J<M;J++){let Y=f+J+D*U,ae=f+J+D*(U+1),Pe=f+(J+1)+D*(U+1),Ee=f+(J+1)+D*U;l.push(Y,ae,Ee),l.push(ae,Pe,Ee),X+=6}o.addGroup(h,X,E),h+=X,f+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var ri=class i extends Ft{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let a=[],r=[],o=[],l=[],c=new k,u=new xe;r.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let p=0,f=3;p<=t;p++,f+=3){let h=n+p/t*s;c.x=e*Math.cos(h),c.y=e*Math.sin(h),r.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(r[f]/e+1)/2,u.y=(r[f+1]/e+1)/2,l.push(u.x,u.y)}for(let p=1;p<=t;p++)a.push(p,p+1,0);this.setIndex(a),this.setAttribute("position",new rt(r,3)),this.setAttribute("normal",new rt(o,3)),this.setAttribute("uv",new rt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},ki=class i extends Ft{constructor(e=1,t=1,n=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),a=Math.floor(a);let u=[],p=[],f=[],h=[],g=0,T=[],m=n/2,d=0;w(),r===!1&&(e>0&&C(!0),t>0&&C(!1)),this.setIndex(u),this.setAttribute("position",new rt(p,3)),this.setAttribute("normal",new rt(f,3)),this.setAttribute("uv",new rt(h,2));function w(){let _=new k,b=new k,y=0,M=(t-e)/n;for(let x=0;x<=a;x++){let E=[],R=x/a,I=R*(t-e)+e;for(let N=0;N<=s;N++){let O=N/s,A=O*l+o,D=Math.sin(A),L=Math.cos(A);b.x=I*D,b.y=-R*n+m,b.z=I*L,p.push(b.x,b.y,b.z),_.set(D,M,L).normalize(),f.push(_.x,_.y,_.z),h.push(O,1-R),E.push(g++)}T.push(E)}for(let x=0;x<s;x++)for(let E=0;E<a;E++){let R=T[E][x],I=T[E+1][x],N=T[E+1][x+1],O=T[E][x+1];(e>0||E!==0)&&(u.push(R,I,O),y+=3),(t>0||E!==a-1)&&(u.push(I,N,O),y+=3)}c.addGroup(d,y,0),d+=y}function C(_){let b=g,y=new xe,M=new k,x=0,E=_===!0?e:t,R=_===!0?1:-1;for(let N=1;N<=s;N++)p.push(0,m*R,0),f.push(0,R,0),h.push(.5,.5),g++;let I=g;for(let N=0;N<=s;N++){let A=N/s*l+o,D=Math.cos(A),L=Math.sin(A);M.x=E*L,M.y=m*R,M.z=E*D,p.push(M.x,M.y,M.z),f.push(0,R,0),y.x=D*.5+.5,y.y=L*.5*R+.5,h.push(y.x,y.y),g++}for(let N=0;N<s;N++){let O=b+N,A=I+N;_===!0?u.push(A,A+1,O):u.push(A+1,A,O),x+=3}c.addGroup(d,x,_===!0?1:2),d+=x}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Kt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){De("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),a=0;t.push(0);for(let r=1;r<=e;r++)n=this.getPoint(r/e),a+=n.distanceTo(s),t.push(a),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,a=n.length,r;t?r=t:r=e*n[a-1];let o=0,l=a-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-r,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===r)return s/(a-1);let u=n[s],f=n[s+1]-u,h=(r-u)/f;return(s+h)/(a-1)}getTangent(e,t){let s=e-1e-4,a=e+1e-4;s<0&&(s=0),a>1&&(a=1);let r=this.getPoint(s),o=this.getPoint(a),l=t||(r.isVector2?new xe:new k);return l.copy(o).sub(r).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new k,s=[],a=[],r=[],o=new k,l=new gt;for(let h=0;h<=e;h++){let g=h/e;s[h]=this.getTangentAt(g,new k)}a[0]=new k,r[0]=new k;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),p=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),p<=c&&(c=p,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),a[0].crossVectors(s[0],o),r[0].crossVectors(s[0],a[0]);for(let h=1;h<=e;h++){if(a[h]=a[h-1].clone(),r[h]=r[h-1].clone(),o.crossVectors(s[h-1],s[h]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos($e(s[h-1].dot(s[h]),-1,1));a[h].applyMatrix4(l.makeRotationAxis(o,g))}r[h].crossVectors(s[h],a[h])}if(t===!0){let h=Math.acos($e(a[0].dot(a[e]),-1,1));h/=e,s[0].dot(o.crossVectors(a[0],a[e]))>0&&(h=-h);for(let g=1;g<=e;g++)a[g].applyMatrix4(l.makeRotationAxis(s[g],h*g)),r[g].crossVectors(s[g],a[g])}return{tangents:s,normals:a,binormals:r}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},zi=class extends Kt{constructor(e=0,t=0,n=1,s=1,a=0,r=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=a,this.aEndAngle=r,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new xe){let n=t,s=Math.PI*2,a=this.aEndAngle-this.aStartAngle,r=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=s;for(;a>s;)a-=s;a<Number.EPSILON&&(r?a=0:a=s),this.aClockwise===!0&&!r&&(a===s?a=-s:a=a-s);let o=this.aStartAngle+e*a,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),p=Math.sin(this.aRotation),f=l-this.aX,h=c-this.aY;l=f*u-h*p+this.aX,c=f*p+h*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Za=class extends zi{constructor(e,t,n,s,a,r){super(e,t,n,n,s,a,r),this.isArcCurve=!0,this.type="ArcCurve"}};function Sl(){let i=0,e=0,t=0,n=0;function s(a,r,o,l){i=a,e=o,t=-3*a+3*r-2*o-l,n=2*a-2*r+o+l}return{initCatmullRom:function(a,r,o,l,c){s(r,o,c*(o-a),c*(l-r))},initNonuniformCatmullRom:function(a,r,o,l,c,u,p){let f=(r-a)/c-(o-a)/(c+u)+(o-r)/u,h=(o-r)/u-(l-r)/(u+p)+(l-o)/p;f*=u,h*=u,s(r,o,f,h)},calc:function(a){let r=a*a,o=r*a;return i+e*a+t*r+n*o}}}var cc=new k,dc=new k,Fo=new Sl,Oo=new Sl,Bo=new Sl,Gi=class extends Kt{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new k){let n=t,s=this.points,a=s.length,r=(a-(this.closed?0:1))*e,o=Math.floor(r),l=r-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/a)+1)*a:l===0&&o===a-1&&(o=a-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%a]:(dc.subVectors(s[0],s[1]).add(s[0]),c=dc);let p=s[o%a],f=s[(o+1)%a];if(this.closed||o+2<a?u=s[(o+2)%a]:(cc.subVectors(s[a-1],s[a-2]).add(s[a-1]),u=cc),this.curveType==="centripetal"||this.curveType==="chordal"){let h=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(p),h),T=Math.pow(p.distanceToSquared(f),h),m=Math.pow(f.distanceToSquared(u),h);T<1e-4&&(T=1),g<1e-4&&(g=T),m<1e-4&&(m=T),Fo.initNonuniformCatmullRom(c.x,p.x,f.x,u.x,g,T,m),Oo.initNonuniformCatmullRom(c.y,p.y,f.y,u.y,g,T,m),Bo.initNonuniformCatmullRom(c.z,p.z,f.z,u.z,g,T,m)}else this.curveType==="catmullrom"&&(Fo.initCatmullRom(c.x,p.x,f.x,u.x,this.tension),Oo.initCatmullRom(c.y,p.y,f.y,u.y,this.tension),Bo.initCatmullRom(c.z,p.z,f.z,u.z,this.tension));return n.set(Fo.calc(l),Oo.calc(l),Bo.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new k().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function hc(i,e,t,n,s){let a=(n-e)*.5,r=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+a+r)*l+(-3*t+3*n-2*a-r)*o+a*i+t}function oh(i,e){let t=1-i;return t*t*e}function lh(i,e){return 2*(1-i)*i*e}function ch(i,e){return i*i*e}function ds(i,e,t,n){return oh(i,e)+lh(i,t)+ch(i,n)}function dh(i,e){let t=1-i;return t*t*t*e}function hh(i,e){let t=1-i;return 3*t*t*i*e}function uh(i,e){return 3*(1-i)*i*i*e}function fh(i,e){return i*i*i*e}function hs(i,e,t,n,s){return dh(i,e)+hh(i,t)+uh(i,n)+fh(i,s)}var Ts=class extends Kt{constructor(e=new xe,t=new xe,n=new xe,s=new xe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new xe){let n=t,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return n.set(hs(e,s.x,a.x,r.x,o.x),hs(e,s.y,a.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ja=class extends Kt{constructor(e=new k,t=new k,n=new k,s=new k){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new k){let n=t,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return n.set(hs(e,s.x,a.x,r.x,o.x),hs(e,s.y,a.y,r.y,o.y),hs(e,s.z,a.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Es=class extends Kt{constructor(e=new xe,t=new xe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new xe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new xe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ka=class extends Kt{constructor(e=new k,t=new k){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new k){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new k){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},As=class extends Kt{constructor(e=new xe,t=new xe,n=new xe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new xe){let n=t,s=this.v0,a=this.v1,r=this.v2;return n.set(ds(e,s.x,a.x,r.x),ds(e,s.y,a.y,r.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Cs=class extends Kt{constructor(e=new k,t=new k,n=new k){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new k){let n=t,s=this.v0,a=this.v1,r=this.v2;return n.set(ds(e,s.x,a.x,r.x),ds(e,s.y,a.y,r.y),ds(e,s.z,a.z,r.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Rs=class extends Kt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new xe){let n=t,s=this.points,a=(s.length-1)*e,r=Math.floor(a),o=a-r,l=s[r===0?r:r-1],c=s[r],u=s[r>s.length-2?s.length-1:r+1],p=s[r>s.length-3?s.length-1:r+2];return n.set(hc(o,l.x,c.x,u.x,p.x),hc(o,l.y,c.y,u.y,p.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new xe().fromArray(s))}return this}},Xo=Object.freeze({__proto__:null,ArcCurve:Za,CatmullRomCurve3:Gi,CubicBezierCurve:Ts,CubicBezierCurve3:Ja,EllipseCurve:zi,LineCurve:Es,LineCurve3:Ka,QuadraticBezierCurve:As,QuadraticBezierCurve3:Cs,SplineCurve:Rs}),ja=class extends Kt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Xo[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),a=0;for(;a<s.length;){if(s[a]>=n){let r=s[a]-n,o=this.curves[a],l=o.getLength(),c=l===0?0:1-r/l;return o.getPointAt(c,t)}a++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,a=this.curves;s<a.length;s++){let r=a[s],o=r.isEllipseCurve?e*2:r.isLineCurve||r.isLineCurve3?1:r.isSplineCurve?e*r.points.length:e,l=r.getPoints(o);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Xo[s.type]().fromJSON(s))}return this}},Ns=class extends ja{constructor(e){super(),this.type="Path",this.currentPoint=new xe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Es(this.currentPoint.clone(),new xe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let a=new As(this.currentPoint.clone(),new xe(e,t),new xe(n,s));return this.curves.push(a),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,a,r){let o=new Ts(this.currentPoint.clone(),new xe(e,t),new xe(n,s),new xe(a,r));return this.curves.push(o),this.currentPoint.set(a,r),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Rs(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,a,r){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,a,r),this}absarc(e,t,n,s,a,r){return this.absellipse(e,t,n,n,s,a,r),this}ellipse(e,t,n,s,a,r,o,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,a,r,o,l),this}absellipse(e,t,n,s,a,r,o,l){let c=new zi(e,t,n,s,a,r,o,l);if(this.curves.length>0){let p=c.getPoint(0);p.equals(this.currentPoint)||this.lineTo(p.x,p.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Vi=class extends Ns{constructor(e){super(e),this.uuid=ji(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Ns().fromJSON(s))}return this}};function ph(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,a=ad(i,0,s,t,!0),r=[];if(!a||a.next===a.prev)return r;let o,l,c;if(n&&(a=_h(i,e,a,t)),i.length>80*t){o=i[0],l=i[1];let u=o,p=l;for(let f=t;f<s;f+=t){let h=i[f],g=i[f+1];h<o&&(o=h),g<l&&(l=g),h>u&&(u=h),g>p&&(p=g)}c=Math.max(u-o,p-l),c=c!==0?32767/c:0}return Is(a,r,t,o,l,c,0),r}function ad(i,e,t,n,s){let a;if(s===Nh(i,e,t,n)>0)for(let r=e;r<t;r+=n)a=uc(r/n|0,i[r],i[r+1],a);else for(let r=t-n;r>=e;r-=n)a=uc(r/n|0,i[r],i[r+1],a);return a&&Hi(a,a.next)&&(Ls(a),a=a.next),a}function oi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Hi(t,t.next)||vt(t.prev,t,t.next)===0)){if(Ls(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Is(i,e,t,n,s,a,r){if(!i)return;!r&&a&&wh(i,n,s,a);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(a?gh(i,n,s,a):mh(i)){e.push(l.i,i.i,c.i),Ls(i),i=c.next,o=c.next;continue}if(i=c,i===o){r?r===1?(i=xh(oi(i),e),Is(i,e,t,n,s,a,2)):r===2&&vh(i,e,t,n,s,a):Is(oi(i),e,t,n,s,a,1);break}}}function mh(i){let e=i.prev,t=i,n=i.next;if(vt(e,t,n)>=0)return!1;let s=e.x,a=t.x,r=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,a,r),p=Math.min(o,l,c),f=Math.max(s,a,r),h=Math.max(o,l,c),g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=f&&g.y>=p&&g.y<=h&&cs(s,o,a,l,r,c,g.x,g.y)&&vt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function gh(i,e,t,n){let s=i.prev,a=i,r=i.next;if(vt(s,a,r)>=0)return!1;let o=s.x,l=a.x,c=r.x,u=s.y,p=a.y,f=r.y,h=Math.min(o,l,c),g=Math.min(u,p,f),T=Math.max(o,l,c),m=Math.max(u,p,f),d=qo(h,g,e,t,n),w=qo(T,m,e,t,n),C=i.prevZ,_=i.nextZ;for(;C&&C.z>=d&&_&&_.z<=w;){if(C.x>=h&&C.x<=T&&C.y>=g&&C.y<=m&&C!==s&&C!==r&&cs(o,u,l,p,c,f,C.x,C.y)&&vt(C.prev,C,C.next)>=0||(C=C.prevZ,_.x>=h&&_.x<=T&&_.y>=g&&_.y<=m&&_!==s&&_!==r&&cs(o,u,l,p,c,f,_.x,_.y)&&vt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;C&&C.z>=d;){if(C.x>=h&&C.x<=T&&C.y>=g&&C.y<=m&&C!==s&&C!==r&&cs(o,u,l,p,c,f,C.x,C.y)&&vt(C.prev,C,C.next)>=0)return!1;C=C.prevZ}for(;_&&_.z<=w;){if(_.x>=h&&_.x<=T&&_.y>=g&&_.y<=m&&_!==s&&_!==r&&cs(o,u,l,p,c,f,_.x,_.y)&&vt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function xh(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Hi(n,s)&&od(n,t,t.next,s)&&Ps(n,s)&&Ps(s,n)&&(e.push(n.i,t.i,s.i),Ls(t),Ls(t.next),t=i=s),t=t.next}while(t!==i);return oi(t)}function vh(i,e,t,n,s,a){let r=i;do{let o=r.next.next;for(;o!==r.prev;){if(r.i!==o.i&&Ah(r,o)){let l=ld(r,o);r=oi(r,r.next),l=oi(l,l.next),Is(r,e,t,n,s,a,0),Is(l,e,t,n,s,a,0);return}o=o.next}r=r.next}while(r!==i)}function _h(i,e,t,n){let s=[];for(let a=0,r=e.length;a<r;a++){let o=e[a]*n,l=a<r-1?e[a+1]*n:i.length,c=ad(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Eh(c))}s.sort(yh);for(let a=0;a<s.length;a++)t=bh(s[a],t);return t}function yh(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function bh(i,e){let t=Sh(i,e);if(!t)return e;let n=ld(t,i);return oi(n,n.next),oi(t,t.next)}function Sh(i,e){let t=e,n=i.x,s=i.y,a=-1/0,r;if(Hi(i,t))return t;do{if(Hi(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let p=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=n&&p>a&&(a=p,r=t.x<t.next.x?t:t.next,p===n))return r}t=t.next}while(t!==e);if(!r)return null;let o=r,l=r.x,c=r.y,u=1/0;t=r;do{if(n>=t.x&&t.x>=l&&n!==t.x&&rd(s<c?n:a,s,l,c,s<c?a:n,s,t.x,t.y)){let p=Math.abs(s-t.y)/(n-t.x);Ps(t,i)&&(p<u||p===u&&(t.x>r.x||t.x===r.x&&Mh(r,t)))&&(r=t,u=p)}t=t.next}while(t!==o);return r}function Mh(i,e){return vt(i.prev,i,e.prev)<0&&vt(e.next,i,i.next)<0}function wh(i,e,t,n){let s=i;do s.z===0&&(s.z=qo(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Th(s)}function Th(i){let e,t=1;do{let n=i,s;i=null;let a=null;for(e=0;n;){e++;let r=n,o=0;for(let c=0;c<t&&(o++,r=r.nextZ,!!r);c++);let l=t;for(;o>0||l>0&&r;)o!==0&&(l===0||!r||n.z<=r.z)?(s=n,n=n.nextZ,o--):(s=r,r=r.nextZ,l--),a?a.nextZ=s:i=s,s.prevZ=a,a=s;n=r}a.nextZ=null,t*=2}while(e>1);return i}function qo(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Eh(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function rd(i,e,t,n,s,a,r,o){return(s-r)*(e-o)>=(i-r)*(a-o)&&(i-r)*(n-o)>=(t-r)*(e-o)&&(t-r)*(a-o)>=(s-r)*(n-o)}function cs(i,e,t,n,s,a,r,o){return!(i===r&&e===o)&&rd(i,e,t,n,s,a,r,o)}function Ah(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Ch(i,e)&&(Ps(i,e)&&Ps(e,i)&&Rh(i,e)&&(vt(i.prev,i,e.prev)||vt(i,e.prev,e))||Hi(i,e)&&vt(i.prev,i,i.next)>0&&vt(e.prev,e,e.next)>0)}function vt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Hi(i,e){return i.x===e.x&&i.y===e.y}function od(i,e,t,n){let s=Aa(vt(i,e,t)),a=Aa(vt(i,e,n)),r=Aa(vt(t,n,i)),o=Aa(vt(t,n,e));return!!(s!==a&&r!==o||s===0&&Ea(i,t,e)||a===0&&Ea(i,n,e)||r===0&&Ea(t,i,n)||o===0&&Ea(t,e,n))}function Ea(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Aa(i){return i>0?1:i<0?-1:0}function Ch(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&od(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Ps(i,e){return vt(i.prev,i,i.next)<0?vt(i,e,i.next)>=0&&vt(i,i.prev,e)>=0:vt(i,e,i.prev)<0||vt(i,i.next,e)<0}function Rh(i,e){let t=i,n=!1,s=(i.x+e.x)/2,a=(i.y+e.y)/2;do t.y>a!=t.next.y>a&&t.next.y!==t.y&&s<(t.next.x-t.x)*(a-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function ld(i,e){let t=$o(i.i,i.x,i.y),n=$o(e.i,e.x,e.y),s=i.next,a=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,a.next=n,n.prev=a,n}function uc(i,e,t,n){let s=$o(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ls(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function $o(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Nh(i,e,t,n){let s=0;for(let a=e,r=t-n;a<t;a+=n)s+=(i[r]-i[a])*(i[a+1]+i[r+1]),r=a;return s}var Yo=class{static triangulate(e,t,n=2){return ph(e,t,n)}},Ni=class i{static area(e){let t=e.length,n=0;for(let s=t-1,a=0;a<t;s=a++)n+=e[s].x*e[a].y-e[a].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],a=[];fc(e),pc(n,e);let r=e.length;t.forEach(fc);for(let l=0;l<t.length;l++)s.push(r),r+=t[l].length,pc(n,t[l]);let o=Yo.triangulate(n,s);for(let l=0;l<o.length;l+=3)a.push(o.slice(l,l+3));return a}};function fc(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function pc(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Ds=class i extends Ft{constructor(e=[new xe(0,-.5),new xe(.5,0),new xe(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=$e(s,0,Math.PI*2);let a=[],r=[],o=[],l=[],c=[],u=1/t,p=new k,f=new xe,h=new k,g=new k,T=new k,m=0,d=0;for(let w=0;w<=e.length-1;w++)switch(w){case 0:m=e[w+1].x-e[w].x,d=e[w+1].y-e[w].y,h.x=d*1,h.y=-m,h.z=d*0,T.copy(h),h.normalize(),l.push(h.x,h.y,h.z);break;case e.length-1:l.push(T.x,T.y,T.z);break;default:m=e[w+1].x-e[w].x,d=e[w+1].y-e[w].y,h.x=d*1,h.y=-m,h.z=d*0,g.copy(h),h.x+=T.x,h.y+=T.y,h.z+=T.z,h.normalize(),l.push(h.x,h.y,h.z),T.copy(g)}for(let w=0;w<=t;w++){let C=n+w*u*s,_=Math.sin(C),b=Math.cos(C);for(let y=0;y<=e.length-1;y++){p.x=e[y].x*_,p.y=e[y].y,p.z=e[y].x*b,r.push(p.x,p.y,p.z),f.x=w/t,f.y=y/(e.length-1),o.push(f.x,f.y);let M=l[3*y+0]*_,x=l[3*y+1],E=l[3*y+0]*b;c.push(M,x,E)}}for(let w=0;w<t;w++)for(let C=0;C<e.length-1;C++){let _=C+w*e.length,b=_,y=_+e.length,M=_+e.length+1,x=_+1;a.push(b,y,x),a.push(M,x,y)}this.setIndex(a),this.setAttribute("position",new rt(r,3)),this.setAttribute("uv",new rt(o,2)),this.setAttribute("normal",new rt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var Us=class i extends Ft{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let a=e/2,r=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,p=e/o,f=t/l,h=[],g=[],T=[],m=[];for(let d=0;d<u;d++){let w=d*f-r;for(let C=0;C<c;C++){let _=C*p-a;g.push(_,-w,0),T.push(0,0,1),m.push(C/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let w=0;w<o;w++){let C=w+c*d,_=w+c*(d+1),b=w+1+c*(d+1),y=w+1+c*d;h.push(C,_,y),h.push(_,b,y)}this.setIndex(h),this.setAttribute("position",new rt(g,3)),this.setAttribute("normal",new rt(T,3)),this.setAttribute("uv",new rt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Fs=class i extends Ft{constructor(e=new Vi([new xe(0,.5),new xe(-.5,-.5),new xe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],s=[],a=[],r=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(o,l,u),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new rt(s,3)),this.setAttribute("normal",new rt(a,3)),this.setAttribute("uv",new rt(r,2));function c(u){let p=s.length/3,f=u.extractPoints(t),h=f.shape,g=f.holes;Ni.isClockWise(h)===!1&&(h=h.reverse());for(let m=0,d=g.length;m<d;m++){let w=g[m];Ni.isClockWise(w)===!0&&(g[m]=w.reverse())}let T=Ni.triangulateShape(h,g);for(let m=0,d=g.length;m<d;m++){let w=g[m];h=h.concat(w)}for(let m=0,d=h.length;m<d;m++){let w=h[m];s.push(w.x,w.y,0),a.push(0,0,1),r.push(w.x,w.y)}for(let m=0,d=T.length;m<d;m++){let w=T[m],C=w[0]+p,_=w[1]+p,b=w[2]+p;n.push(C,_,b),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Ih(t,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let r=t[e.shapes[s]];n.push(r)}return new i(n,e.curveSegments)}};function Ih(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}var Wi=class i extends Ft{constructor(e=1,t=.4,n=12,s=48,a=Math.PI*2,r=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:a,thetaStart:r,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],u=[],p=[],f=new k,h=new k,g=new k;for(let T=0;T<=n;T++){let m=r+T/n*o;for(let d=0;d<=s;d++){let w=d/s*a;h.x=(e+t*Math.cos(m))*Math.cos(w),h.y=(e+t*Math.cos(m))*Math.sin(w),h.z=t*Math.sin(m),c.push(h.x,h.y,h.z),f.x=e*Math.cos(w),f.y=e*Math.sin(w),g.subVectors(h,f).normalize(),u.push(g.x,g.y,g.z),p.push(d/s),p.push(T/n)}}for(let T=1;T<=n;T++)for(let m=1;m<=s;m++){let d=(s+1)*T+m-1,w=(s+1)*(T-1)+m-1,C=(s+1)*(T-1)+m,_=(s+1)*T+m;l.push(d,w,_),l.push(w,C,_)}this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var Os=class i extends Ft{constructor(e=new Cs(new k(-1,-1,0),new k(-1,1,0),new k(1,1,0)),t=64,n=1,s=8,a=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:a};let r=e.computeFrenetFrames(t,a);this.tangents=r.tangents,this.normals=r.normals,this.binormals=r.binormals;let o=new k,l=new k,c=new xe,u=new k,p=[],f=[],h=[],g=[];T(),this.setIndex(g),this.setAttribute("position",new rt(p,3)),this.setAttribute("normal",new rt(f,3)),this.setAttribute("uv",new rt(h,2));function T(){for(let C=0;C<t;C++)m(C);m(a===!1?t:0),w(),d()}function m(C){u=e.getPointAt(C/t,u);let _=r.normals[C],b=r.binormals[C];for(let y=0;y<=s;y++){let M=y/s*Math.PI*2,x=Math.sin(M),E=-Math.cos(M);l.x=E*_.x+x*b.x,l.y=E*_.y+x*b.y,l.z=E*_.z+x*b.z,l.normalize(),f.push(l.x,l.y,l.z),o.x=u.x+n*l.x,o.y=u.y+n*l.y,o.z=u.z+n*l.z,p.push(o.x,o.y,o.z)}}function d(){for(let C=1;C<=t;C++)for(let _=1;_<=s;_++){let b=(s+1)*(C-1)+(_-1),y=(s+1)*C+(_-1),M=(s+1)*C+_,x=(s+1)*(C-1)+_;g.push(b,y,x),g.push(y,M,x)}}function w(){for(let C=0;C<=t;C++)for(let _=0;_<=s;_++)c.x=C/t,c.y=_/s,h.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Xo[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function di(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(mc(s))s.isRenderTargetTexture?(De("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(mc(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();e[t][n]=a}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Bt(i){let e={};for(let t=0;t<i.length;t++){let n=di(i[t]);for(let s in n)e[s]=n[s]}return e}function mc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Ph(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ml(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ke.workingColorSpace}var cd={clone:di,merge:Bt},Lh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,jt=class extends Hn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Lh,this.fragmentShader=Dh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=di(e.uniforms),this.uniformsGroups=Ph(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?t.uniforms[s]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[s]={type:"m4",value:r.toArray()}:t.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ye().setHex(s.value);break;case"v2":this.uniforms[n].value=new xe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new k().fromArray(s.value);break;case"v4":this.uniforms[n].value=new xt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ke().fromArray(s.value);break;case"m4":this.uniforms[n].value=new gt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Qa=class extends jt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Bs=class extends Hn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=to,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var er=class extends Hn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},tr=class extends Hn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ei(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ko(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Xn=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],a=t[n-1];n:{e:{let r;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<a)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(a=s,s=t[++n],e<s)break e}r=t.length;break t}if(!(e>=a)){let o=t[1];e<o&&(n=2,a=o);for(let l=n-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=a,a=t[--n-1],e>=a)break e}r=n,n=0;break t}break n}for(;n<r;){let o=n+r>>>1;e<t[o]?r=o:n=o+1}if(s=t[n],a=t[n-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,a,s)}return this.interpolate_(n,a,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,a=e*s;for(let r=0;r!==s;++r)t[r]=n[a+r];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},nr=class extends Xn{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Vo,endingEnd:Vo}}intervalChanged_(e,t,n){let s=this.parameterPositions,a=e-2,r=e+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Ho:a=e,o=2*t-n;break;case Wo:a=s.length-2,o=t+s[a]-s[a+1];break;default:a=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ho:r=e,l=2*n-t;break;case Wo:r=1,l=n+s[1]-s[0];break;default:r=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=a*u,this._offsetNext=r*u}interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,p=this._offsetNext,f=this._weightPrev,h=this._weightNext,g=(n-t)/(s-t),T=g*g,m=T*g,d=-f*m+2*f*T-f*g,w=(1+f)*m+(-1.5-2*f)*T+(-.5+f)*g+1,C=(-1-h)*m+(1.5+h)*T+.5*g,_=h*m-h*T;for(let b=0;b!==o;++b)a[b]=d*r[u+b]+w*r[c+b]+C*r[l+b]+_*r[p+b];return a}},ir=class extends Xn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),p=1-u;for(let f=0;f!==o;++f)a[f]=r[c+f]*p+r[l+f]*u;return a}},sr=class extends Xn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ar=class extends Xn{interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,p=this.outTangents;if(!u||!p){let g=(n-t)/(s-t),T=1-g;for(let m=0;m!==o;++m)a[m]=r[c+m]*T+r[l+m]*g;return a}let f=o*2,h=e-1;for(let g=0;g!==o;++g){let T=r[c+g],m=r[l+g],d=h*f+g*2,w=p[d],C=p[d+1],_=e*f+g*2,b=u[_],y=u[_+1],M=Fh(n,t,w,b,s);a[g]=dd(M,T,C,y,m)}return a}};function dd(i,e,t,n,s){let a=1-i;return a*a*a*e+3*a*a*i*t+3*a*i*i*n+i*i*i*s}function Uh(i,e,t,n,s){let a=1-i;return 3*a*a*(t-e)+6*a*i*(n-t)+3*i*i*(s-n)}function Fh(i,e,t,n,s){let a=(i-e)/(s-e);for(let r=0;r<8;r++){let o=dd(a,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Uh(a,e,t,n,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var Qt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ei(t,this.TimeBufferType),this.values=Ei(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ei(e.times,Array),values:Ei(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),ko(e.settings)&&(n.settings={inTangents:Ei(e.settings.inTangents,Array),outTangents:Ei(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new sr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ir(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new nr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ar(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case us:t=this.InterpolantFactoryMethodDiscrete;break;case Ga:t=this.InterpolantFactoryMethodLinear;break;case Na:t=this.InterpolantFactoryMethodSmooth;break;case Go:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return De("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return us;case this.InterpolantFactoryMethodLinear:return Ga;case this.InterpolantFactoryMethodSmooth:return Na;case this.InterpolantFactoryMethodBezier:return Go}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;ko(this.settings)&&(gc(this.settings.inTangents,e),gc(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,a=0,r=s-1;for(;a!==s&&n[a]<e;)++a;for(;r!==-1&&n[r]>t;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=n.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Fe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,a=n.length;a===0&&(Fe("KeyframeTrack: Track is empty.",this),e=!1);let r=null;for(let o=0;o!==a;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Fe("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(r!==null&&r>l){Fe("KeyframeTrack: Out of order keys.",this,o,l,r),e=!1;break}r=l}if(s!==void 0&&Gd(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Fe("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Na,a=e.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let p=o*n,f=p-n,h=p+n;for(let g=0;g!==n;++g){let T=t[p+g];if(T!==t[f+g]||T!==t[h+g]){l=!0;break}}}if(l){if(o!==r){e[r]=e[o];let p=o*n,f=r*n;for(let h=0;h!==n;++h)t[f+h]=t[p+h]}++r}}if(a>0){e[r]=e[a];for(let o=a*n,l=r*n,c=0;c!==n;++c)t[l+c]=t[o+c];++r}return r!==e.length?(this.times=e.slice(0,r),this.values=t.slice(0,r*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,ko(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function gc(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Qt.prototype.ValueTypeName="";Qt.prototype.TimeBufferType=Float32Array;Qt.prototype.ValueBufferType=Float32Array;Qt.prototype.DefaultInterpolation=Ga;var qn=class extends Qt{constructor(e,t,n){super(e,t,n)}};qn.prototype.ValueTypeName="bool";qn.prototype.ValueBufferType=Array;qn.prototype.DefaultInterpolation=us;qn.prototype.InterpolantFactoryMethodLinear=void 0;qn.prototype.InterpolantFactoryMethodSmooth=void 0;var rr=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};rr.prototype.ValueTypeName="color";var or=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};or.prototype.ValueTypeName="number";var lr=class extends Xn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)bn.slerpFlat(a,0,r,c-o,r,c,l);return a}},ks=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new lr(this.times,this.values,this.getValueSize(),e)}};ks.prototype.ValueTypeName="quaternion";ks.prototype.InterpolantFactoryMethodSmooth=void 0;var $n=class extends Qt{constructor(e,t,n){super(e,t,n)}};$n.prototype.ValueTypeName="string";$n.prototype.ValueBufferType=Array;$n.prototype.DefaultInterpolation=us;$n.prototype.InterpolantFactoryMethodLinear=void 0;$n.prototype.InterpolantFactoryMethodSmooth=void 0;var cr=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};cr.prototype.ValueTypeName="vector";var dr=class{constructor(e,t,n){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,a===!1&&s.onStart!==void 0&&s.onStart(u,r,o),a=!0},this.itemEnd=function(u){r++,s.onProgress!==void 0&&s.onProgress(u,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,p){return c.push(u,p),this},this.removeHandler=function(u){let p=c.indexOf(u);return p!==-1&&c.splice(p,2),this},this.getHandler=function(u){for(let p=0,f=c.length;p<f;p+=2){let h=c[p],g=c[p+1];if(h.global&&(h.lastIndex=0),h.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},hd=new dr,hr=class{constructor(e){this.manager=e!==void 0?e:hd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,a){n.load(e,s,t,a)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};hr.DEFAULT_MATERIAL_NAME="__DEFAULT";var Xi=class extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},zs=class extends Xi{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ye(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},zo=new gt,xc=new k,vc=new k,Gs=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new xe(512,512),this.mapType=qt,this.map=null,this.mapPass=null,this.matrix=new gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oi,this._frameExtents=new xe(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;xc.setFromMatrixPosition(e.matrixWorld),t.position.copy(xc),vc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vc),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){zo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(zo,e.coordinateSystem,e.reversedDepth);let a=this._frameExtents,r=s?s.z/a.x:1,o=s?s.w/a.y:1,l=s?s.x/a.x:0,c=s?s.y/a.y:0;e.coordinateSystem===Pi||e.reversedDepth?t.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(zo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ca=new k,Ra=new bn,xn=new k,Vs=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new gt,this.projectionMatrix=new gt,this.projectionMatrixInverse=new gt,this.coordinateSystem=dn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ca,Ra,xn),xn.x===1&&xn.y===1&&xn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ca,Ra,xn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ca,Ra,xn),xn.x===1&&xn.y===1&&xn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ca,Ra,xn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},zn=new k,_c=new xe,yc=new xe,Rt=class extends Vs{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Va*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(mo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Va*2*Math.atan(Math.tan(mo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){zn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(zn.x,zn.y).multiplyScalar(-e/zn.z),zn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(zn.x,zn.y).multiplyScalar(-e/zn.z)}getViewSize(e,t){return this.getViewBounds(e,_c,yc),t.subVectors(yc,_c)}setViewOffset(e,t,n,s,a,r){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(mo*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,t-=r.offsetY*n/c,s*=r.width/l,n*=r.height/c}let o=this.filmOffset;o!==0&&(a+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Zo=class extends Gs{constructor(){super(new Rt(90,1,.5,500)),this.isPointLightShadow=!0}},Hs=class extends Xi{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Zo}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},qi=class extends Vs{constructor(e=-1,t=1,n=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=n-e,r=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Jo=class extends Gs{constructor(){super(new qi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$i=class extends Xi{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new Jo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Ai=-90,Ci=1,ur=class extends Ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Rt(Ai,Ci,e,t);s.layers=this.layers,this.add(s);let a=new Rt(Ai,Ci,e,t);a.layers=this.layers,this.add(a);let r=new Rt(Ai,Ci,e,t);r.layers=this.layers,this.add(r);let o=new Rt(Ai,Ci,e,t);o.layers=this.layers,this.add(o);let l=new Rt(Ai,Ci,e,t);l.layers=this.layers,this.add(l);let c=new Rt(Ai,Ci,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,a,r,o,l]=t;for(let c of t)this.remove(c);if(e===dn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Pi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,u]=this.children,p=e.getRenderTarget(),f=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let T=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=T,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(p,f,h),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},fr=class extends Rt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var wl="\\[\\]\\.:\\/",Oh=new RegExp("["+wl+"]","g"),Tl="[^"+wl+"]",Bh="[^"+wl.replace("\\.","")+"]",kh=/((?:WC+[\/:])*)/.source.replace("WC",Tl),zh=/(WCOD+)?/.source.replace("WCOD",Bh),Gh=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Tl),Vh=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Tl),Hh=new RegExp("^"+kh+zh+Gh+Vh+"$"),Wh=["material","materials","bones","map"],Ko=class{constructor(e,t,n){let s=n||pt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=n.length;s!==a;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},pt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Oh,"")}static parseTrackName(e){let t=Hh.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=n.nodeName.substring(s+1);Wh.indexOf(a)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=a)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,a=n.length;s!==a;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,a=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){De("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Fe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Fe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Fe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Fe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Fe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let r=e[s];if(r===void 0){let c=t.nodeName;Fe("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[a]!==void 0&&(a=e.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};pt.Composite=Ko;pt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};pt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};pt.prototype.GetterByBindingType=[pt.prototype._getValue_direct,pt.prototype._getValue_array,pt.prototype._getValue_arrayElement,pt.prototype._getValue_toArray];pt.prototype.SetterByBindingTypeAndVersioning=[[pt.prototype._setValue_direct,pt.prototype._setValue_direct_setNeedsUpdate,pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_array,pt.prototype._setValue_array_setNeedsUpdate,pt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_arrayElement,pt.prototype._setValue_arrayElement_setNeedsUpdate,pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_fromArray,pt.prototype._setValue_fromArray_setNeedsUpdate,pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bg=new Float32Array(1);var Ws=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,De("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var Il=class Il{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let a=this.elements;return a[0]=e,a[2]=t,a[1]=n,a[3]=s,this}};Il.prototype.isMatrix2=!0;var jo=Il;function El(i,e,t,n){let s=Xh(n);switch(t){case xl:return i*e;case _l:return i*e/s.components*s.byteLength;case Sr:return i*e/s.components*s.byteLength;case jn:return i*e*2/s.components*s.byteLength;case Mr:return i*e*2/s.components*s.byteLength;case vl:return i*e*3/s.components*s.byteLength;case an:return i*e*4/s.components*s.byteLength;case wr:return i*e*4/s.components*s.byteLength;case Zs:case Js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ks:case js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Er:case Cr:return Math.max(i,16)*Math.max(e,8)/4;case Tr:case Ar:return Math.max(i,8)*Math.max(e,8)/2;case Rr:case Nr:case Pr:case Lr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ir:case Qs:case Dr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ur:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fr:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Or:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Br:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case kr:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case zr:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Gr:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Vr:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Hr:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Wr:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Xr:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case qr:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case $r:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Yr:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Zr:case Jr:case Kr:return Math.ceil(i/4)*Math.ceil(e/4)*16;case jr:case Qr:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ea:case eo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Xh(i){switch(i){case qt:case fl:return{byteLength:1,components:1};case Ji:case pl:case pn:return{byteLength:2,components:1};case yr:case br:return{byteLength:2,components:4};case un:case _r:case fn:return{byteLength:4,components:1};case ml:case gl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?De("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Ld(){let i=null,e=!1,t=null,n=null;function s(a,r){n=i.requestAnimationFrame(s),t(a,r)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){i=a}}}function $h(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,p=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,u),o.onUploadCallback();let h;if(c instanceof Float32Array)h=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)h=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?h=i.HALF_FLOAT:h=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)h=i.SHORT;else if(c instanceof Uint32Array)h=i.UNSIGNED_INT;else if(c instanceof Int32Array)h=i.INT;else if(c instanceof Int8Array)h=i.BYTE;else if(c instanceof Uint8Array)h=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)h=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:h,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,l,c){let u=l.array,p=l.updateRanges;if(i.bindBuffer(c,o),p.length===0)i.bufferSubData(c,0,u);else{p.sort((h,g)=>h.start-g.start);let f=0;for(let h=1;h<p.length;h++){let g=p[f],T=p[h];T.start<=g.start+g.count+1?g.count=Math.max(g.count,T.start+T.count-g.start):(++f,p[f]=T)}p.length=f+1;for(let h=0,g=p.length;h<g;h++){let T=p[h];i.bufferSubData(c,T.start*u.BYTES_PER_ELEMENT,u,T.start,T.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var Yh=`#ifdef USE_ALPHAHASH
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
}`,$u=`
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
#endif`,Yu=`#if defined( RE_IndirectDiffuse )
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
#endif`,$f=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
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
}`,qe={alphahash_fragment:Yh,alphahash_pars_fragment:Zh,alphamap_fragment:Jh,alphamap_pars_fragment:Kh,alphatest_fragment:jh,alphatest_pars_fragment:Qh,aomap_fragment:eu,aomap_pars_fragment:tu,batching_pars_vertex:nu,batching_vertex:iu,begin_vertex:su,beginnormal_vertex:au,bsdfs:ru,iridescence_fragment:ou,bumpmap_pars_fragment:lu,clipping_planes_fragment:cu,clipping_planes_pars_fragment:du,clipping_planes_pars_vertex:hu,clipping_planes_vertex:uu,color_fragment:fu,color_pars_fragment:pu,color_pars_vertex:mu,color_vertex:gu,common:xu,cube_uv_reflection_fragment:vu,defaultnormal_vertex:_u,displacementmap_pars_vertex:yu,displacementmap_vertex:bu,emissivemap_fragment:Su,emissivemap_pars_fragment:Mu,colorspace_fragment:wu,colorspace_pars_fragment:Tu,envmap_fragment:Eu,envmap_common_pars_fragment:Au,envmap_pars_fragment:Cu,envmap_pars_vertex:Ru,envmap_physical_pars_fragment:zu,envmap_vertex:Nu,fog_vertex:Iu,fog_pars_vertex:Pu,fog_fragment:Lu,fog_pars_fragment:Du,gradientmap_pars_fragment:Uu,lightmap_pars_fragment:Fu,lights_lambert_fragment:Ou,lights_lambert_pars_fragment:Bu,lights_pars_begin:ku,lights_toon_fragment:Gu,lights_toon_pars_fragment:Vu,lights_phong_fragment:Hu,lights_phong_pars_fragment:Wu,lights_physical_fragment:Xu,lights_physical_pars_fragment:qu,lights_fragment_begin:$u,lights_fragment_maps:Yu,lights_fragment_end:Zu,lightprobes_pars_fragment:Ju,logdepthbuf_fragment:Ku,logdepthbuf_pars_fragment:ju,logdepthbuf_pars_vertex:Qu,logdepthbuf_vertex:ef,map_fragment:tf,map_pars_fragment:nf,map_particle_fragment:sf,map_particle_pars_fragment:af,metalnessmap_fragment:rf,metalnessmap_pars_fragment:of,morphinstance_vertex:lf,morphcolor_vertex:cf,morphnormal_vertex:df,morphtarget_pars_vertex:hf,morphtarget_vertex:uf,normal_fragment_begin:ff,normal_fragment_maps:pf,normal_pars_fragment:mf,normal_pars_vertex:gf,normal_vertex:xf,normalmap_pars_fragment:vf,clearcoat_normal_fragment_begin:_f,clearcoat_normal_fragment_maps:yf,clearcoat_pars_fragment:bf,iridescence_pars_fragment:Sf,opaque_fragment:Mf,packing:wf,premultiplied_alpha_fragment:Tf,project_vertex:Ef,dithering_fragment:Af,dithering_pars_fragment:Cf,roughnessmap_fragment:Rf,roughnessmap_pars_fragment:Nf,shadowmap_pars_fragment:If,shadowmap_pars_vertex:Pf,shadowmap_vertex:Lf,shadowmask_pars_fragment:Df,skinbase_vertex:Uf,skinning_pars_vertex:Ff,skinning_vertex:Of,skinnormal_vertex:Bf,specularmap_fragment:kf,specularmap_pars_fragment:zf,tonemapping_fragment:Gf,tonemapping_pars_fragment:Vf,transmission_fragment:Hf,transmission_pars_fragment:Wf,uv_pars_fragment:Xf,uv_pars_vertex:qf,uv_vertex:$f,worldpos_vertex:Yf,background_vert:Zf,background_frag:Jf,backgroundCube_vert:Kf,backgroundCube_frag:jf,cube_vert:Qf,cube_frag:ep,depth_vert:tp,depth_frag:np,distance_vert:ip,distance_frag:sp,equirect_vert:ap,equirect_frag:rp,linedashed_vert:op,linedashed_frag:lp,meshbasic_vert:cp,meshbasic_frag:dp,meshlambert_vert:hp,meshlambert_frag:up,meshmatcap_vert:fp,meshmatcap_frag:pp,meshnormal_vert:mp,meshnormal_frag:gp,meshphong_vert:xp,meshphong_frag:vp,meshphysical_vert:_p,meshphysical_frag:yp,meshtoon_vert:bp,meshtoon_frag:Sp,points_vert:Mp,points_frag:wp,shadow_vert:Tp,shadow_frag:Ep,sprite_vert:Ap,sprite_frag:Cp},ve={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new xe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new xe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},wn={basic:{uniforms:Bt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:Bt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ye(0)},envMapIntensity:{value:1}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:Bt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:Bt([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:Bt([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new Ye(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:Bt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:Bt([ve.points,ve.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:Bt([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:Bt([ve.common,ve.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:Bt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:Bt([ve.sprite,ve.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distance:{uniforms:Bt([ve.common,ve.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distance_vert,fragmentShader:qe.distance_frag},shadow:{uniforms:Bt([ve.lights,ve.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};wn.physical={uniforms:Bt([wn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new xe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new xe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new xe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};var so={r:0,b:0,g:0},Rp=new gt,Dd=new ke;Dd.set(-1,0,0,0,1,0,0,0,1);function Np(i,e,t,n,s,a){let r=new Ye(0),o=s===!0?0:1,l,c,u=null,p=0,f=null;function h(w){let C=w.isScene===!0?w.background:null;if(C&&C.isTexture){let _=w.backgroundBlurriness>0;C=e.get(C,_)}return C}function g(w){let C=!1,_=h(w);_===null?m(r,o):_&&_.isColor&&(m(_,1),C=!0);let b=i.xr.getEnvironmentBlendMode();b==="additive"?t.buffers.color.setClear(0,0,0,1,a):b==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,a),(i.autoClear||C)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function T(w,C){let _=h(C);_&&(_.isCubeTexture||_.mapping===$s)?(c===void 0&&(c=new Xt(new Bi(1,1,1),new jt({name:"BackgroundCubeMaterial",uniforms:di(wn.backgroundCube.uniforms),vertexShader:wn.backgroundCube.vertexShader,fragmentShader:wn.backgroundCube.fragmentShader,side:Gt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,y,M){this.matrixWorld.copyPosition(M.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=C.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Rp.makeRotationFromEuler(C.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Dd),c.material.toneMapped=Ke.getTransfer(_.colorSpace)!==at,(u!==_||p!==_.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=_,p=_.version,f=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new Xt(new Us(2,2),new jt({name:"BackgroundMaterial",uniforms:di(wn.background.uniforms),vertexShader:wn.background.vertexShader,fragmentShader:wn.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,l.material.toneMapped=Ke.getTransfer(_.colorSpace)!==at,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||p!==_.version||f!==i.toneMapping)&&(l.material.needsUpdate=!0,u=_,p=_.version,f=i.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function m(w,C){w.getRGB(so,Ml(i)),t.buffers.color.setClear(so.r,so.g,so.b,C,a)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(w,C=1){r.set(w),o=C,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(w){o=w,m(r,o)},render:g,addToRenderList:T,dispose:d}}function Ip(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),a=s,r=!1;function o(I,N,O,A,D){let L=!1,V=p(I,A,O,N);a!==V&&(a=V,c(a.object)),L=h(I,A,O,D),L&&g(I,A,O,D),D!==null&&e.update(D,i.ELEMENT_ARRAY_BUFFER),(L||r)&&(r=!1,_(I,N,O,A),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(D).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function u(I){return i.deleteVertexArray(I)}function p(I,N,O,A){let D=A.wireframe===!0,L=n[N.id];L===void 0&&(L={},n[N.id]=L);let V=I.isInstancedMesh===!0?I.id:0,X=L[V];X===void 0&&(X={},L[V]=X);let H=X[O.id];H===void 0&&(H={},X[O.id]=H);let U=H[D];return U===void 0&&(U=f(l()),H[D]=U),U}function f(I){let N=[],O=[],A=[];for(let D=0;D<t;D++)N[D]=0,O[D]=0,A[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:O,attributeDivisors:A,object:I,attributes:{},index:null}}function h(I,N,O,A){let D=a.attributes,L=N.attributes,V=0,X=O.getAttributes();for(let H in X)if(X[H].location>=0){let J=D[H],Y=L[H];if(Y===void 0&&(H==="instanceMatrix"&&I.instanceMatrix&&(Y=I.instanceMatrix),H==="instanceColor"&&I.instanceColor&&(Y=I.instanceColor)),J===void 0||J.attribute!==Y||Y&&J.data!==Y.data)return!0;V++}return a.attributesNum!==V||a.index!==A}function g(I,N,O,A){let D={},L=N.attributes,V=0,X=O.getAttributes();for(let H in X)if(X[H].location>=0){let J=L[H];J===void 0&&(H==="instanceMatrix"&&I.instanceMatrix&&(J=I.instanceMatrix),H==="instanceColor"&&I.instanceColor&&(J=I.instanceColor));let Y={};Y.attribute=J,J&&J.data&&(Y.data=J.data),D[H]=Y,V++}a.attributes=D,a.attributesNum=V,a.index=A}function T(){let I=a.newAttributes;for(let N=0,O=I.length;N<O;N++)I[N]=0}function m(I){d(I,0)}function d(I,N){let O=a.newAttributes,A=a.enabledAttributes,D=a.attributeDivisors;O[I]=1,A[I]===0&&(i.enableVertexAttribArray(I),A[I]=1),D[I]!==N&&(i.vertexAttribDivisor(I,N),D[I]=N)}function w(){let I=a.newAttributes,N=a.enabledAttributes;for(let O=0,A=N.length;O<A;O++)N[O]!==I[O]&&(i.disableVertexAttribArray(O),N[O]=0)}function C(I,N,O,A,D,L,V){V===!0?i.vertexAttribIPointer(I,N,O,D,L):i.vertexAttribPointer(I,N,O,A,D,L)}function _(I,N,O,A){T();let D=A.attributes,L=O.getAttributes(),V=N.defaultAttributeValues;for(let X in L){let H=L[X];if(H.location>=0){let U=D[X];if(U===void 0&&(X==="instanceMatrix"&&I.instanceMatrix&&(U=I.instanceMatrix),X==="instanceColor"&&I.instanceColor&&(U=I.instanceColor)),U!==void 0){let J=U.normalized,Y=U.itemSize,ae=e.get(U);if(ae===void 0)continue;let Pe=ae.buffer,Ee=ae.type,we=ae.bytesPerElement,K=Ee===i.INT||Ee===i.UNSIGNED_INT||U.gpuType===_r;if(U.isInterleavedBufferAttribute){let j=U.data,ce=j.stride,be=U.offset;if(j.isInstancedInterleavedBuffer){for(let ge=0;ge<H.locationSize;ge++)d(H.location+ge,j.meshPerAttribute);I.isInstancedMesh!==!0&&A._maxInstanceCount===void 0&&(A._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let ge=0;ge<H.locationSize;ge++)m(H.location+ge);i.bindBuffer(i.ARRAY_BUFFER,Pe);for(let ge=0;ge<H.locationSize;ge++)C(H.location+ge,Y/H.locationSize,Ee,J,ce*we,(be+Y/H.locationSize*ge)*we,K)}else{if(U.isInstancedBufferAttribute){for(let j=0;j<H.locationSize;j++)d(H.location+j,U.meshPerAttribute);I.isInstancedMesh!==!0&&A._maxInstanceCount===void 0&&(A._maxInstanceCount=U.meshPerAttribute*U.count)}else for(let j=0;j<H.locationSize;j++)m(H.location+j);i.bindBuffer(i.ARRAY_BUFFER,Pe);for(let j=0;j<H.locationSize;j++)C(H.location+j,Y/H.locationSize,Ee,J,Y*we,Y/H.locationSize*j*we,K)}}else if(V!==void 0){let J=V[X];if(J!==void 0)switch(J.length){case 2:i.vertexAttrib2fv(H.location,J);break;case 3:i.vertexAttrib3fv(H.location,J);break;case 4:i.vertexAttrib4fv(H.location,J);break;default:i.vertexAttrib1fv(H.location,J)}}}}w()}function b(){E();for(let I in n){let N=n[I];for(let O in N){let A=N[O];for(let D in A){let L=A[D];for(let V in L)u(L[V].object),delete L[V];delete A[D]}}delete n[I]}}function y(I){if(n[I.id]===void 0)return;let N=n[I.id];for(let O in N){let A=N[O];for(let D in A){let L=A[D];for(let V in L)u(L[V].object),delete L[V];delete A[D]}}delete n[I.id]}function M(I){for(let N in n){let O=n[N];for(let A in O){let D=O[A];if(D[I.id]===void 0)continue;let L=D[I.id];for(let V in L)u(L[V].object),delete L[V];delete D[I.id]}}}function x(I){for(let N in n){let O=n[N],A=I.isInstancedMesh===!0?I.id:0,D=O[A];if(D!==void 0){for(let L in D){let V=D[L];for(let X in V)u(V[X].object),delete V[X];delete D[L]}delete O[A],Object.keys(O).length===0&&delete n[N]}}}function E(){R(),r=!0,a!==s&&(a=s,c(a.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:R,dispose:b,releaseStatesOfGeometry:y,releaseStatesOfObject:x,releaseStatesOfProgram:M,initAttributes:T,enableAttribute:m,disableUnusedAttributes:w}}function Pp(i,e,t){let n;function s(l){n=l}function a(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function r(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let f=0;for(let h=0;h<u;h++)f+=c[h];t.update(f,n,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function Lp(i,e,t,n){let s;function a(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let M=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(M){return!(M!==an&&n.convert(M)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(M){let x=M===pn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(M!==qt&&M!==fn&&!x&&n.convert(M)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(M){if(M==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(De("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let p=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&De("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),C=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),b=i.getParameter(i.MAX_SAMPLES),y=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:f,maxTextures:h,maxVertexTextures:g,maxTextureSize:T,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:w,maxVaryings:C,maxFragmentUniforms:_,maxSamples:b,samples:y}}function Dp(i){let e=this,t=null,n=0,s=!1,a=!1,r=new cn,o=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,f){let h=p.length!==0||f||n!==0||s;return s=f,n=p.length,h},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,f){t=u(p,f,0)},this.setState=function(p,f,h){let g=p.clippingPlanes,T=p.clipIntersection,m=p.clipShadows,d=i.get(p);if(!s||g===null||g.length===0||a&&!m)a?u(null):c();else{let w=a?0:n,C=w*4,_=d.clippingState||null;l.value=_,_=u(g,f,C,h);for(let b=0;b!==C;++b)_[b]=t[b];d.clippingState=_,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(p,f,h,g){let T=p!==null?p.length:0,m=null;if(T!==0){if(m=l.value,g!==!0||m===null){let d=h+T*4,w=f.matrixWorldInverse;o.getNormalMatrix(w),(m===null||m.length<d)&&(m=new Float32Array(d));for(let C=0,_=h;C!==T;++C,_+=4)r.copy(p[C]).applyMatrix4(w,o),r.normal.toArray(m,_),m[_+3]=r.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=T,e.numIntersection=0,m}}var es=4,Up=6,Fp=20,Op=256,ta=new qi,ud=new Ye,Pl=null,Ll=0,Dl=0,Ul=!1,Bp=new k,hi=new k,ro=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,a={}){let{size:r=256,position:o=Bp}=a;Pl=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Ul=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=md(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Pl,Ll,Dl),this._renderer.xr.enabled=Ul,e.scissorTest=!1,Qi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Zn||e.mapping===ci?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Pl=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Ul=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Nt,minFilter:Nt,generateMipmaps:!1,type:pn,format:an,colorSpace:fs,depthBuffer:!1},s=fd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=fd(e,t,n);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=kp(a)),this._blurMaterial=Gp(a,e,t),this._ggxMaterial=zp(a,e,t)}return s}_compileMaterial(e){let t=new Xt(new Ft,e);this._renderer.compile(t,ta)}_sceneToCubeUV(e,t,n,s,a){let l=new Rt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],p=this._renderer,f=p.autoClear,h=p.toneMapping;p.getClearColor(ud),p.toneMapping=hn,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Xt(new Bi,new Ss({name:"PMREM.Background",side:Gt,depthWrite:!1,depthTest:!1})));let T=this._backgroundBox,m=T.material,d=!1,w=e.background;w?w.isColor&&(m.color.copy(w),e.background=null,d=!0):(m.color.copy(ud),d=!0);for(let C=0;C<6;C++){let _=C%3;_===0?(l.up.set(0,c[C],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+u[C],a.y,a.z)):_===1?(l.up.set(0,0,c[C]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+u[C],a.z)):(l.up.set(0,c[C],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+u[C]));let b=this._cubeSize;Qi(s,_*b,C>2?b:0,b,b),p.setRenderTarget(s),d&&p.render(T,l),p.render(e,l)}p.toneMapping=h,p.autoClear=f,e.background=w}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Zn||e.mapping===ci;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=md()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pd());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=e;let l=this._cubeSize;Qi(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(r,ta)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(e,a-1,a);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[n];o.material=r;let l=r.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),p=Math.sqrt(c*c-u*u),f=c*1.25,h=p*f,{_lodMax:g}=this,T=this._sizeLods[n],m=3*T*(n>g-es?n-g+es:0),d=4*(this._cubeSize-T);l.envMap.value=e.texture,l.roughness.value=h,l.mipInt.value=g-t,Qi(a,m,d,3*T,2*T),s.setRenderTarget(a),s.render(o,ta),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=g-n,Qi(e,m,d,3*T,2*T),s.setRenderTarget(e),s.render(o,ta)}_blur(e,t,n,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,a,t,n,r),this._blurPass(a,e,n,n,r)}_blurPass(e,t,n,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],p=3*u*(s>this._lodMax-es?s-this._lodMax+es:0),f=4*(this._cubeSize-u);Qi(t,p,f,3*u,2*u),r.setRenderTarget(t),r.render(l,ta)}};function kp(i){let e=[],t=[],n=i,s=i-es+1+Up;for(let a=0;a<s;a++){let r=Math.pow(2,n);e.push(r);let o=1/(r-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],p=6,f=6,h=3,g=new Float32Array(h*f*p),T=new Float32Array(h*f*p);for(let d=0;d<p;d++){let w=d%3*2/3-1,C=d>2?0:-1,_=[w,C,0,w+2/3,C,0,w+2/3,C+1,0,w,C,0,w+2/3,C+1,0,w,C+1,0];g.set(_,h*f*d);for(let b=0;b<f;b++){let y=u[b*2]*2-1,M=u[b*2+1]*2-1;d===0?hi.set(1,M,y):d===1?hi.set(-y,1,-M):d===2?hi.set(-y,M,1):d===3?hi.set(-1,M,-y):d===4?hi.set(-y,-1,M):hi.set(y,M,-1),hi.toArray(T,(d*f+b)*h)}}let m=new Ft;m.setAttribute("position",new sn(g,h)),m.setAttribute("outputDirection",new sn(T,h)),t.push(new Xt(m,null)),n>es&&n--}return{lodMeshes:t,sizeLods:e}}function fd(i,e,t){let n=new Wt(i,e,t);return n.texture.mapping=$s,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Qi(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function zp(i,e,t){return new jt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Op,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:co(),fragmentShader:`

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
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Gp(i,e,t){return new jt({name:"SphericalGaussianBlur",defines:{SAMPLES:Fp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:co(),fragmentShader:`

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
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function pd(){return new jt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:co(),fragmentShader:`

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
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function md(){return new jt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:co(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function co(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var oo=class extends Wt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ms(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Bi(5,5,5),a=new jt({name:"CubemapFromEquirect",uniforms:di(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Gt,blending:Sn});a.uniforms.tEquirect.value=t;let r=new Xt(s,a),o=t.minFilter;return t.minFilter===Jn&&(t.minFilter=Nt),new ur(1,10,this).update(e,r),t.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let a=e.getRenderTarget();for(let r=0;r<6;r++)e.setRenderTarget(this,r),e.clear(t,n,s);e.setRenderTarget(a)}};function Vp(i){let e=new WeakMap,t=new WeakMap,n=null;function s(f,h=!1){return f==null?null:h?r(f):a(f)}function a(f){if(f&&f.isTexture){let h=f.mapping;if(h===gr||h===xr)if(e.has(f)){let g=e.get(f).texture;return o(g,f.mapping)}else{let g=f.image;if(g&&g.height>0){let T=new oo(g.height);return T.fromEquirectangularTexture(i,f),e.set(f,T),f.addEventListener("dispose",c),o(T.texture,f.mapping)}else return null}}return f}function r(f){if(f&&f.isTexture){let h=f.mapping,g=h===gr||h===xr,T=h===Zn||h===ci;if(g||T){let m=t.get(f),d=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==d)return n===null&&(n=new ro(i)),m=g?n.fromEquirectangular(f,m):n.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),m.texture;if(m!==void 0)return m.texture;{let w=f.image;return g&&w&&w.height>0||T&&w&&l(w)?(n===null&&(n=new ro(i)),m=g?n.fromEquirectangular(f):n.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),f.addEventListener("dispose",u),m.texture):null}}}return f}function o(f,h){return h===gr?f.mapping=Zn:h===xr&&(f.mapping=ci),f}function l(f){let h=0,g=6;for(let T=0;T<g;T++)f[T]!==void 0&&h++;return h===g}function c(f){let h=f.target;h.removeEventListener("dispose",c);let g=e.get(h);g!==void 0&&(e.delete(h),g.dispose())}function u(f){let h=f.target;h.removeEventListener("dispose",u);let g=t.get(h);g!==void 0&&(t.delete(h),g.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:p}}function Hp(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&ai("WebGLRenderer: "+n+" extension not supported."),s}}}function Wp(i,e,t,n){let s={},a=new WeakMap;function r(p){let f=p.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",r),delete s[f.id];let h=a.get(f);h&&(e.remove(h),a.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(p,f){return s[f.id]===!0||(f.addEventListener("dispose",r),s[f.id]=!0,t.memory.geometries++),f}function l(p){let f=p.attributes;for(let h in f)e.update(f[h],i.ARRAY_BUFFER)}function c(p){let f=[],h=p.index,g=p.attributes.position,T=0;if(g===void 0)return;if(h!==null){let w=h.array;T=h.version;for(let C=0,_=w.length;C<_;C+=3){let b=w[C+0],y=w[C+1],M=w[C+2];f.push(b,y,y,M,M,b)}}else{let w=g.array;T=g.version;for(let C=0,_=w.length/3-1;C<_;C+=3){let b=C+0,y=C+1,M=C+2;f.push(b,y,y,M,M,b)}}let m=new(g.count>=65535?bs:ys)(f,1);m.version=T;let d=a.get(p);d&&e.remove(d),a.set(p,m)}function u(p){let f=a.get(p);if(f){let h=p.index;h!==null&&f.version<h.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:u}}function Xp(i,e,t){let n;function s(p){n=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,f){i.drawElements(n,f,a,p*r),t.update(f,n,1)}function c(p,f,h){h!==0&&(i.drawElementsInstanced(n,f,a,p*r,h),t.update(f,n,h))}function u(p,f,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,a,p,0,h);let T=0;for(let m=0;m<h;m++)T+=f[m];t.update(T,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function qp(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(a,r,o){switch(t.calls++,r){case i.TRIANGLES:t.triangles+=o*(a/3);break;case i.LINES:t.lines+=o*(a/2);break;case i.LINE_STRIP:t.lines+=o*(a-1);break;case i.LINE_LOOP:t.lines+=o*a;break;case i.POINTS:t.points+=o*a;break;default:Fe("WebGLInfo: Unknown draw mode:",r);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function $p(i,e,t){let n=new WeakMap,s=new xt;function a(r,o,l){let c=r.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=u!==void 0?u.length:0,f=n.get(o);if(f===void 0||f.count!==p){let E=function(){M.dispose(),n.delete(o),o.removeEventListener("dispose",E)};f!==void 0&&f.texture.dispose();let h=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,T=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],C=0;h===!0&&(C=1),g===!0&&(C=2),T===!0&&(C=3);let _=o.attributes.position.count*C,b=1;_>e.maxTextureSize&&(b=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);let y=new Float32Array(_*b*4*p),M=new gs(y,_,b,p);M.type=fn,M.needsUpdate=!0;let x=C*4;for(let R=0;R<p;R++){let I=m[R],N=d[R],O=w[R],A=_*b*4*R;for(let D=0;D<I.count;D++){let L=D*x;h===!0&&(s.fromBufferAttribute(I,D),y[A+L+0]=s.x,y[A+L+1]=s.y,y[A+L+2]=s.z,y[A+L+3]=0),g===!0&&(s.fromBufferAttribute(N,D),y[A+L+4]=s.x,y[A+L+5]=s.y,y[A+L+6]=s.z,y[A+L+7]=0),T===!0&&(s.fromBufferAttribute(O,D),y[A+L+8]=s.x,y[A+L+9]=s.y,y[A+L+10]=s.z,y[A+L+11]=O.itemSize===4?s.w:1)}}f={count:p,texture:M,size:new xe(_,b)},n.set(o,f),o.addEventListener("dispose",E)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",r.morphTexture,t);else{let h=0;for(let T=0;T<c.length;T++)h+=c[T];let g=o.morphTargetsRelative?1:1-h;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:a}}function Yp(i,e,t,n,s){let a=new WeakMap;function r(c){let u=s.render.frame,p=c.geometry,f=e.get(c,p);if(a.get(f)!==u&&(e.update(f),a.set(f,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),a.set(c,u))),c.isSkinnedMesh){let h=c.skeleton;a.get(h)!==u&&(h.update(),a.set(h,u))}return f}function o(){a=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:r,dispose:o}}var Zp={[rl]:"LINEAR_TONE_MAPPING",[ol]:"REINHARD_TONE_MAPPING",[ll]:"CINEON_TONE_MAPPING",[qs]:"ACES_FILMIC_TONE_MAPPING",[dl]:"AGX_TONE_MAPPING",[hl]:"NEUTRAL_TONE_MAPPING",[cl]:"CUSTOM_TONE_MAPPING"};function Jp(i,e,t,n,s,a){let r=new Wt(e,t,{type:i,depthBuffer:s,stencilBuffer:a,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Ft;c.setAttribute("position",new rt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new rt([0,2,0,0,2,0],2));let u=new Qa({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),p=new Xt(c,u),f=new qi(-1,1,1,-1,0,1),h=null,g=null,T=!1,m,d=null,w=[],C=!1;this.setSize=function(_,b){r.setSize(_,b),o!==null&&o.setSize(_,b),l!==null&&l.setSize(_,b);for(let y=0;y<w.length;y++){let M=w[y];M.setSize&&M.setSize(_,b)}},this.setEffects=function(_){w=_,C=w.length>0&&w[0].isRenderPass===!0;let b=r.width,y=r.height;w.length>0&&o===null&&(o=new Wt(b,y,{type:pn,depthBuffer:!1,stencilBuffer:!1}),l=new Wt(b,y,{type:pn,depthBuffer:!1,stencilBuffer:!1}));for(let M=0;M<w.length;M++){let x=w[M];x.setSize&&x.setSize(b,y)}},this.begin=function(_,b){if(T||_.toneMapping===hn&&w.length===0)return!1;if(d=b,b!==null){let y=b.width,M=b.height;(r.width!==y||r.height!==M)&&this.setSize(y,M)}return C===!1&&_.setRenderTarget(r),m=_.toneMapping,_.toneMapping=hn,!0},this.hasRenderPass=function(){return C},this.end=function(_,b){_.toneMapping=m,T=!0;let y=r,M=o;for(let x=0;x<w.length;x++){let E=w[x];E.enabled!==!1&&(E.render(_,M,y,b),E.needsSwap!==!1&&(y=M,M=M===o?l:o))}if(h!==_.outputColorSpace||g!==_.toneMapping){h=_.outputColorSpace,g=_.toneMapping,u.defines={},Ke.getTransfer(h)===at&&(u.defines.SRGB_TRANSFER="");let x=Zp[g];x&&(u.defines[x]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=y.texture,_.setRenderTarget(d),_.render(p,f),d=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var Ud=new Ht,Bl=new Wn(1,1),Fd=new gs,Od=new Xa,Bd=new Ms,gd=[],xd=[],vd=new Float32Array(16),_d=new Float32Array(9),yd=new Float32Array(4);function ns(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,a=gd[s];if(a===void 0&&(a=new Float32Array(s),gd[s]=a),e!==0){n.toArray(a,0);for(let r=1,o=0;r!==e;++r)o+=t,i[r].toArray(a,o)}return a}function wt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Tt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ho(i,e){let t=xd[e];t===void 0&&(t=new Int32Array(e),xd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Kp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function jp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(wt(t,e))return;i.uniform2fv(this.addr,e),Tt(t,e)}}function Qp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(wt(t,e))return;i.uniform3fv(this.addr,e),Tt(t,e)}}function em(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(wt(t,e))return;i.uniform4fv(this.addr,e),Tt(t,e)}}function tm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(wt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Tt(t,e)}else{if(wt(t,n))return;yd.set(n),i.uniformMatrix2fv(this.addr,!1,yd),Tt(t,n)}}function nm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(wt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Tt(t,e)}else{if(wt(t,n))return;_d.set(n),i.uniformMatrix3fv(this.addr,!1,_d),Tt(t,n)}}function im(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(wt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Tt(t,e)}else{if(wt(t,n))return;vd.set(n),i.uniformMatrix4fv(this.addr,!1,vd),Tt(t,n)}}function sm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function am(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(wt(t,e))return;i.uniform2iv(this.addr,e),Tt(t,e)}}function rm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(wt(t,e))return;i.uniform3iv(this.addr,e),Tt(t,e)}}function om(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(wt(t,e))return;i.uniform4iv(this.addr,e),Tt(t,e)}}function lm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function cm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(wt(t,e))return;i.uniform2uiv(this.addr,e),Tt(t,e)}}function dm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(wt(t,e))return;i.uniform3uiv(this.addr,e),Tt(t,e)}}function hm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(wt(t,e))return;i.uniform4uiv(this.addr,e),Tt(t,e)}}function um(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let a;this.type===i.SAMPLER_2D_SHADOW?(Bl.compareFunction=t.isReversedDepthBuffer()?io:no,a=Bl):a=Ud,t.setTexture2D(e||a,s)}function fm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Od,s)}function pm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Bd,s)}function mm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Fd,s)}function gm(i){switch(i){case 5126:return Kp;case 35664:return jp;case 35665:return Qp;case 35666:return em;case 35674:return tm;case 35675:return nm;case 35676:return im;case 5124:case 35670:return sm;case 35667:case 35671:return am;case 35668:case 35672:return rm;case 35669:case 35673:return om;case 5125:return lm;case 36294:return cm;case 36295:return dm;case 36296:return hm;case 35678:case 36198:case 36298:case 36306:case 35682:return um;case 35679:case 36299:case 36307:return fm;case 35680:case 36300:case 36308:case 36293:return pm;case 36289:case 36303:case 36311:case 36292:return mm}}function xm(i,e){i.uniform1fv(this.addr,e)}function vm(i,e){let t=ns(e,this.size,2);i.uniform2fv(this.addr,t)}function _m(i,e){let t=ns(e,this.size,3);i.uniform3fv(this.addr,t)}function ym(i,e){let t=ns(e,this.size,4);i.uniform4fv(this.addr,t)}function bm(i,e){let t=ns(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Sm(i,e){let t=ns(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Mm(i,e){let t=ns(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function wm(i,e){i.uniform1iv(this.addr,e)}function Tm(i,e){i.uniform2iv(this.addr,e)}function Em(i,e){i.uniform3iv(this.addr,e)}function Am(i,e){i.uniform4iv(this.addr,e)}function Cm(i,e){i.uniform1uiv(this.addr,e)}function Rm(i,e){i.uniform2uiv(this.addr,e)}function Nm(i,e){i.uniform3uiv(this.addr,e)}function Im(i,e){i.uniform4uiv(this.addr,e)}function Pm(i,e,t){let n=this.cache,s=e.length,a=ho(t,s);wt(n,a)||(i.uniform1iv(this.addr,a),Tt(n,a));let r;this.type===i.SAMPLER_2D_SHADOW?r=Bl:r=Ud;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||r,a[o])}function Lm(i,e,t){let n=this.cache,s=e.length,a=ho(t,s);wt(n,a)||(i.uniform1iv(this.addr,a),Tt(n,a));for(let r=0;r!==s;++r)t.setTexture3D(e[r]||Od,a[r])}function Dm(i,e,t){let n=this.cache,s=e.length,a=ho(t,s);wt(n,a)||(i.uniform1iv(this.addr,a),Tt(n,a));for(let r=0;r!==s;++r)t.setTextureCube(e[r]||Bd,a[r])}function Um(i,e,t){let n=this.cache,s=e.length,a=ho(t,s);wt(n,a)||(i.uniform1iv(this.addr,a),Tt(n,a));for(let r=0;r!==s;++r)t.setTexture2DArray(e[r]||Fd,a[r])}function Fm(i){switch(i){case 5126:return xm;case 35664:return vm;case 35665:return _m;case 35666:return ym;case 35674:return bm;case 35675:return Sm;case 35676:return Mm;case 5124:case 35670:return wm;case 35667:case 35671:return Tm;case 35668:case 35672:return Em;case 35669:case 35673:return Am;case 5125:return Cm;case 36294:return Rm;case 36295:return Nm;case 36296:return Im;case 35678:case 36198:case 36298:case 36306:case 35682:return Pm;case 35679:case 36299:case 36307:return Lm;case 35680:case 36300:case 36308:case 36293:return Dm;case 36289:case 36303:case 36311:case 36292:return Um}}var kl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=gm(t.type)}},zl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Fm(t.type)}},Gl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(e,t[o.id],n)}}},Fl=/(\w+)(\])?(\[|\.)?/g;function bd(i,e){i.seq.push(e),i.map[e.id]=e}function Om(i,e,t){let n=i.name,s=n.length;for(Fl.lastIndex=0;;){let a=Fl.exec(n),r=Fl.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){bd(t,c===void 0?new kl(o,i,e):new zl(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new Gl(o),bd(t,p)),t=p}}}var ts=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let o=e.getActiveUniform(t,r),l=e.getUniformLocation(t,o.name);Om(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===e.SAMPLER_2D_SHADOW||r.type===e.SAMPLER_CUBE_SHADOW||r.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(e,t,n,s){let a=this.map[t];a!==void 0&&a.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let a=0,r=t.length;a!==r;++a){let o=t[a],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,a=e.length;s!==a;++s){let r=e[s];r.id in t&&n.push(r)}return n}};function Sd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Bm=37297,km=0;function zm(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let r=s;r<a;r++){let o=r+1;n.push(`${o===e?">":" "} ${o}: ${t[r]}`)}return n.join(`
`)}var Md=new ke;function Gm(i){Ke._getMatrix(Md,Ke.workingColorSpace,i);let e=`mat3( ${Md.elements.map(t=>t.toFixed(4))} )`;switch(Ke.getTransfer(i)){case ps:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return De("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function wd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),a=(i.getShaderInfoLog(e)||"").trim();if(n&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+a+`

`+zm(i.getShaderSource(e),o)}else return a}function Vm(i,e){let t=Gm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Hm={[rl]:"Linear",[ol]:"Reinhard",[ll]:"Cineon",[qs]:"ACESFilmic",[dl]:"AgX",[hl]:"Neutral",[cl]:"Custom"};function Wm(i,e){let t=Hm[e];return t===void 0?(De("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ao=new k;function Xm(){Ke.getLuminanceCoefficients(ao);let i=ao.x.toFixed(4),e=ao.y.toFixed(4),t=ao.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function qm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ia).join(`
`)}function $m(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Ym(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let a=i.getActiveAttrib(e,s),r=a.name,o=1;a.type===i.FLOAT_MAT2&&(o=2),a.type===i.FLOAT_MAT3&&(o=3),a.type===i.FLOAT_MAT4&&(o=4),t[r]={type:a.type,location:i.getAttribLocation(e,r),locationSize:o}}return t}function ia(i){return i!==""}function Td(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ed(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Zm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Vl(i){return i.replace(Zm,Km)}var Jm=new Map;function Km(i,e){let t=qe[e];if(t===void 0){let n=Jm.get(e);if(n!==void 0)t=qe[n],De('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Vl(t)}var jm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ad(i){return i.replace(jm,Qm)}function Qm(i,e,t,n){let s="";for(let a=parseInt(e);a<parseInt(t);a++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function Cd(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var eg={[Xs]:"SHADOWMAP_TYPE_PCF",[Yi]:"SHADOWMAP_TYPE_VSM"};function tg(i){return eg[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var ng={[Zn]:"ENVMAP_TYPE_CUBE",[ci]:"ENVMAP_TYPE_CUBE",[$s]:"ENVMAP_TYPE_CUBE_UV"};function ig(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":ng[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var sg={[ci]:"ENVMAP_MODE_REFRACTION"};function ag(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":sg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var rg={[al]:"ENVMAP_BLENDING_MULTIPLY",[Gc]:"ENVMAP_BLENDING_MIX",[Vc]:"ENVMAP_BLENDING_ADD"};function og(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":rg[i.combine]||"ENVMAP_BLENDING_NONE"}function lg(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function cg(i,e,t,n){let s=i.getContext(),a=t.defines,r=t.vertexShader,o=t.fragmentShader,l=tg(t),c=ig(t),u=ag(t),p=og(t),f=lg(t),h=qm(t),g=$m(a),T=s.createProgram(),m,d,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ia).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ia).join(`
`),d.length>0&&(d+=`
`)):(m=[Cd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ia).join(`
`),d=[Cd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+p:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==hn?"#define TONE_MAPPING":"",t.toneMapping!==hn?qe.tonemapping_pars_fragment:"",t.toneMapping!==hn?Wm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,Vm("linearToOutputTexel",t.outputColorSpace),Xm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ia).join(`
`)),r=Vl(r),r=Td(r,t),r=Ed(r,t),o=Vl(o),o=Td(o,t),o=Ed(o,t),r=Ad(r),o=Ad(o),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,m=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===yl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===yl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let C=w+m+r,_=w+d+o,b=Sd(s,s.VERTEX_SHADER,C),y=Sd(s,s.FRAGMENT_SHADER,_);s.attachShader(T,b),s.attachShader(T,y),t.index0AttributeName!==void 0?s.bindAttribLocation(T,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(T,0,"position"),s.linkProgram(T);function M(I){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(T)||"",O=s.getShaderInfoLog(b)||"",A=s.getShaderInfoLog(y)||"",D=N.trim(),L=O.trim(),V=A.trim(),X=!0,H=!0;if(s.getProgramParameter(T,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,T,b,y);else{let U=wd(s,b,"vertex"),J=wd(s,y,"fragment");Fe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(T,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+D+`
`+U+`
`+J)}else D!==""?De("WebGLProgram: Program Info Log:",D):(L===""||V==="")&&(H=!1);H&&(I.diagnostics={runnable:X,programLog:D,vertexShader:{log:L,prefix:m},fragmentShader:{log:V,prefix:d}})}s.deleteShader(b),s.deleteShader(y),x=new ts(s,T),E=Ym(s,T)}let x;this.getUniforms=function(){return x===void 0&&M(this),x};let E;this.getAttributes=function(){return E===void 0&&M(this),E};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(T,Bm)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(T),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=km++,this.cacheKey=e,this.usedTimes=1,this.program=T,this.vertexShader=b,this.fragmentShader=y,this}var dg=0,Hl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Wl(e),t.set(e,n)),n}},Wl=class{constructor(e){this.id=dg++,this.code=e,this.usedTimes=0}};function hg(i){return i===jn||i===Qs||i===ea}function ug(i,e,t,n,s,a){let r=new xs,o=new Hl,l=new Set,c=[],u=new Map,p=n.logarithmicDepthBuffer,f=n.precision,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function T(x,E,R,I,N,O){let A=I.fog,D=N.geometry,L=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,V=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,X=e.get(x.envMap||L,V),H=X&&X.mapping===$s?X.image.height:null,U=h[x.type];x.precision!==null&&(f=n.getMaxPrecision(x.precision),f!==x.precision&&De("WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));let J=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,Y=J!==void 0?J.length:0,ae=0;D.morphAttributes.position!==void 0&&(ae=1),D.morphAttributes.normal!==void 0&&(ae=2),D.morphAttributes.color!==void 0&&(ae=3);let Pe,Ee,we,K;if(U){let Le=wn[U];Pe=Le.vertexShader,Ee=Le.fragmentShader}else{Pe=x.vertexShader,Ee=x.fragmentShader;let Le=o.getVertexShaderStage(x),Be=o.getFragmentShaderStage(x);o.update(x,Le,Be),we=Le.id,K=Be.id}let j=i.getRenderTarget(),ce=i.state.buffers.depth.getReversed(),be=N.isInstancedMesh===!0,ge=N.isBatchedMesh===!0,Oe=!!x.map,dt=!!x.matcap,ze=!!X,We=!!x.aoMap,je=!!x.lightMap,Ge=!!x.bumpMap&&x.wireframe===!1,Ze=!!x.normalMap,ht=!!x.displacementMap,ot=!!x.emissiveMap,nt=!!x.metalnessMap,tt=!!x.roughnessMap,z=x.anisotropy>0,He=x.clearcoat>0,Ve=x.dispersion>0,P=x.retroreflectivity>0,v=x.iridescence>0,G=x.sheen>0,W=x.transmission>0,ee=z&&!!x.anisotropyMap,le=He&&!!x.clearcoatMap,de=He&&!!x.clearcoatNormalMap,Q=He&&!!x.clearcoatRoughnessMap,ne=v&&!!x.iridescenceMap,me=v&&!!x.iridescenceThicknessMap,Se=G&&!!x.sheenColorMap,he=G&&!!x.sheenRoughnessMap,ue=!!x.specularMap,Ae=!!x.specularColorMap,Ie=!!x.specularIntensityMap,Ue=W&&!!x.transmissionMap,B=W&&!!x.thicknessMap,fe=!!x.gradientMap,te=!!x.alphaMap,pe=x.alphaTest>0,oe=!!x.alphaHash,se=!!x.extensions,ie=hn;x.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(ie=i.toneMapping);let re={shaderID:U,shaderType:x.type,shaderName:x.name,vertexShader:Pe,fragmentShader:Ee,defines:x.defines,customVertexShaderID:we,customFragmentShaderID:K,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:ge,batchingColor:ge&&N._colorsTexture!==null,instancing:be,instancingColor:be&&N.instanceColor!==null,instancingMorph:be&&N.morphTexture!==null,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Ke.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Oe,matcap:dt,envMap:ze,envMapMode:ze&&X.mapping,envMapCubeUVHeight:H,aoMap:We,lightMap:je,bumpMap:Ge,normalMap:Ze,displacementMap:ht,emissiveMap:ot,normalMapObjectSpace:Ze&&x.normalMapType===Xc,normalMapTangentSpace:Ze&&x.normalMapType===to,packedNormalMap:Ze&&x.normalMapType===to&&hg(x.normalMap.format),metalnessMap:nt,roughnessMap:tt,anisotropy:z,anisotropyMap:ee,clearcoat:He,clearcoatMap:le,clearcoatNormalMap:de,clearcoatRoughnessMap:Q,dispersion:Ve,retroreflection:P,iridescence:v,iridescenceMap:ne,iridescenceThicknessMap:me,sheen:G,sheenColorMap:Se,sheenRoughnessMap:he,specularMap:ue,specularColorMap:Ae,specularIntensityMap:Ie,transmission:W,transmissionMap:Ue,thicknessMap:B,gradientMap:fe,opaque:x.transparent===!1&&x.blending===Zi&&x.alphaToCoverage===!1,alphaMap:te,alphaTest:pe,alphaHash:oe,combine:x.combine,mapUv:Oe&&g(x.map.channel),aoMapUv:We&&g(x.aoMap.channel),lightMapUv:je&&g(x.lightMap.channel),bumpMapUv:Ge&&g(x.bumpMap.channel),normalMapUv:Ze&&g(x.normalMap.channel),displacementMapUv:ht&&g(x.displacementMap.channel),emissiveMapUv:ot&&g(x.emissiveMap.channel),metalnessMapUv:nt&&g(x.metalnessMap.channel),roughnessMapUv:tt&&g(x.roughnessMap.channel),anisotropyMapUv:ee&&g(x.anisotropyMap.channel),clearcoatMapUv:le&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:de&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:me&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Se&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:he&&g(x.sheenRoughnessMap.channel),specularMapUv:ue&&g(x.specularMap.channel),specularColorMapUv:Ae&&g(x.specularColorMap.channel),specularIntensityMapUv:Ie&&g(x.specularIntensityMap.channel),transmissionMapUv:Ue&&g(x.transmissionMap.channel),thicknessMapUv:B&&g(x.thicknessMap.channel),alphaMapUv:te&&g(x.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(Ze||z),vertexNormals:!!D.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!D.attributes.uv&&(Oe||te),fog:!!A,useFog:x.fog===!0,fogExp2:!!A&&A.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||D.attributes.normal===void 0&&Ze===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:ce,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:Y,morphTextureStride:ae,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:ie,decodeVideoTexture:Oe&&x.map.isVideoTexture===!0&&Ke.getTransfer(x.map.colorSpace)===at,decodeVideoTextureEmissive:ot&&x.emissiveMap.isVideoTexture===!0&&Ke.getTransfer(x.emissiveMap.colorSpace)===at,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ot,flipSided:x.side===Gt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:se&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&x.extensions.multiDraw===!0||ge)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return re.vertexUv1s=l.has(1),re.vertexUv2s=l.has(2),re.vertexUv3s=l.has(3),l.clear(),re}function m(x){let E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)E.push(R),E.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(d(E,x),w(E,x),E.push(i.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function d(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numSunLights),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numSunLightShadows),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function w(x,E){r.disableAll(),E.instancing&&r.enable(0),E.instancingColor&&r.enable(1),E.instancingMorph&&r.enable(2),E.matcap&&r.enable(3),E.envMap&&r.enable(4),E.normalMapObjectSpace&&r.enable(5),E.normalMapTangentSpace&&r.enable(6),E.clearcoat&&r.enable(7),E.iridescence&&r.enable(8),E.alphaTest&&r.enable(9),E.vertexColors&&r.enable(10),E.vertexAlphas&&r.enable(11),E.vertexUv1s&&r.enable(12),E.vertexUv2s&&r.enable(13),E.vertexUv3s&&r.enable(14),E.vertexTangents&&r.enable(15),E.anisotropy&&r.enable(16),E.alphaHash&&r.enable(17),E.batching&&r.enable(18),E.dispersion&&r.enable(19),E.retroreflection&&r.enable(24),E.batchingColor&&r.enable(20),E.gradientMap&&r.enable(21),E.packedNormalMap&&r.enable(22),E.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),E.fog&&r.enable(0),E.useFog&&r.enable(1),E.flatShading&&r.enable(2),E.logarithmicDepthBuffer&&r.enable(3),E.reversedDepthBuffer&&r.enable(4),E.skinning&&r.enable(5),E.morphTargets&&r.enable(6),E.morphNormals&&r.enable(7),E.morphColors&&r.enable(8),E.premultipliedAlpha&&r.enable(9),E.shadowMapEnabled&&r.enable(10),E.doubleSided&&r.enable(11),E.flipSided&&r.enable(12),E.useDepthPacking&&r.enable(13),E.dithering&&r.enable(14),E.transmission&&r.enable(15),E.sheen&&r.enable(16),E.opaque&&r.enable(17),E.pointsUvs&&r.enable(18),E.decodeVideoTexture&&r.enable(19),E.decodeVideoTextureEmissive&&r.enable(20),E.alphaToCoverage&&r.enable(21),E.numLightProbeGrids>0&&r.enable(22),E.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function C(x){let E=h[x.type],R;if(E){let I=wn[E];R=cd.clone(I.uniforms)}else R=x.uniforms;return R}function _(x,E){let R=u.get(E);return R!==void 0?++R.usedTimes:(R=new cg(i,E,x,s),c.push(R),u.set(E,R)),R}function b(x){if(--x.usedTimes===0){let E=c.indexOf(x);c[E]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function y(x){o.remove(x)}function M(){o.dispose()}return{getParameters:T,getProgramCacheKey:m,getUniforms:C,acquireProgram:_,releaseProgram:b,releaseShaderCache:y,programs:c,dispose:M}}function fg(){let i=new WeakMap;function e(r){return i.has(r)}function t(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function n(r){i.delete(r)}function s(r,o,l){i.get(r)[o]=l}function a(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:a}}function pg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Rd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Nd(){let i=[],e=0,t=[],n=[],s=[];function a(){e=0,t.length=0,n.length=0,s.length=0}function r(f){let h=0;return f.isInstancedMesh&&(h+=2),f.isSkinnedMesh&&(h+=1),h}function o(f,h,g,T,m,d){let w=i[e];return w===void 0?(w={id:f.id,object:f,geometry:h,material:g,materialVariant:r(f),groupOrder:T,renderOrder:f.renderOrder,z:m,group:d},i[e]=w):(w.id=f.id,w.object=f,w.geometry=h,w.material=g,w.materialVariant=r(f),w.groupOrder=T,w.renderOrder=f.renderOrder,w.z=m,w.group=d),e++,w}function l(f,h,g,T,m,d,w){w.reversedDepth===!0&&(m=-m);let C=o(f,h,g,T,m,d);g.transmission>0?n.push(C):g.transparent===!0?s.push(C):t.push(C)}function c(f,h,g,T,m,d){let w=o(f,h,g,T,m,d);g.transmission>0?n.unshift(w):g.transparent===!0?s.unshift(w):t.unshift(w)}function u(f,h){t.length>1&&t.sort(f||pg),n.length>1&&n.sort(h||Rd),s.length>1&&s.sort(h||Rd)}function p(){for(let f=e,h=i.length;f<h;f++){let g=i[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:a,push:l,unshift:c,finish:p,sort:u}}function mg(){let i=new WeakMap;function e(n,s){let a=i.get(n),r;return a===void 0?(r=new Nd,i.set(n,[r])):s>=a.length?(r=new Nd,a.push(r)):r=a[s],r}function t(){i=new WeakMap}return{get:e,dispose:t}}function gg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new k,color:new Ye};break;case"SpotLight":t={position:new k,direction:new k,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":t={color:new Ye,position:new k,halfWidth:new k,halfHeight:new k};break}return i[e.id]=t,t}}}function xg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var vg=0;function _g(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function yg(i){let e=new gg,t=xg(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new k);let s=new k,a=new gt,r=new gt;function o(c){let u=0,p=0,f=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let h=0,g=0,T=0,m=0,d=0,w=0,C=0,_=0,b=0,y=0,M=0,x=0,E=0,R=0;c.sort(_g);for(let N=0,O=c.length;N<O;N++){let A=c[N],D=A.color,L=A.intensity,V=A.distance,X=null;if(A.shadow&&A.shadow.map&&(A.shadow.map.texture.format===jn?X=A.shadow.map.texture:X=A.shadow.map.depthTexture||A.shadow.map.texture),A.isAmbientLight)u+=D.r*L,p+=D.g*L,f+=D.b*L;else if(A.isLightProbe){for(let H=0;H<9;H++)n.probe[H].addScaledVector(A.sh.coefficients[H],L);R++}else if(A.isSunLight){let H=e.get(A);if(H.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){let U=A.shadow,J=t.get(A);J.shadowIntensity=U.intensity,J.shadowBias=U.bias,J.shadowNormalBias=U.normalBias,J.shadowRadius=U.radius,J.shadowMapSize.copy(U.mapSize).multiply(U.getFrameExtents()),n.sunShadow[g]=J,n.sunShadowMap[g]=X;let Y=U.getViewportCount();for(let ae=0;ae<Y;ae++)n.sunShadowMatrix[T+ae]=U.getMatrix(ae),n.sunShadowCascade[T+ae]=U._cascadeData[ae];T+=Y,g++}n.sun[h]=H,h++}else if(A.isDirectionalLight){let H=e.get(A);if(H.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){let U=A.shadow,J=t.get(A);J.shadowIntensity=U.intensity,J.shadowBias=U.bias,J.shadowNormalBias=U.normalBias,J.shadowRadius=U.radius,J.shadowMapSize=U.mapSize,n.directionalShadow[m]=J,n.directionalShadowMap[m]=X,n.directionalShadowMatrix[m]=A.shadow.matrix,b++}n.directional[m]=H,m++}else if(A.isSpotLight){let H=e.get(A);H.position.setFromMatrixPosition(A.matrixWorld),H.color.copy(D).multiplyScalar(L),H.distance=V,H.coneCos=Math.cos(A.angle),H.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),H.decay=A.decay,n.spot[w]=H;let U=A.shadow;if(A.map&&(n.spotLightMap[x]=A.map,x++,U.updateMatrices(A),A.castShadow&&E++),n.spotLightMatrix[w]=U.matrix,A.castShadow){let J=t.get(A);J.shadowIntensity=U.intensity,J.shadowBias=U.bias,J.shadowNormalBias=U.normalBias,J.shadowRadius=U.radius,J.shadowMapSize=U.mapSize,n.spotShadow[w]=J,n.spotShadowMap[w]=X,M++}w++}else if(A.isRectAreaLight){let H=e.get(A);H.color.copy(D).multiplyScalar(L),H.halfWidth.set(A.width*.5,0,0),H.halfHeight.set(0,A.height*.5,0),n.rectArea[C]=H,C++}else if(A.isPointLight){let H=e.get(A);if(H.color.copy(A.color).multiplyScalar(A.intensity),H.distance=A.distance,H.decay=A.decay,A.castShadow){let U=A.shadow,J=t.get(A);J.shadowIntensity=U.intensity,J.shadowBias=U.bias,J.shadowNormalBias=U.normalBias,J.shadowRadius=U.radius,J.shadowMapSize=U.mapSize,J.shadowCameraNear=U.camera.near,J.shadowCameraFar=U.camera.far,n.pointShadow[d]=J,n.pointShadowMap[d]=X,n.pointShadowMatrix[d]=A.shadow.matrix,y++}n.point[d]=H,d++}else if(A.isHemisphereLight){let H=e.get(A);H.skyColor.copy(A.color).multiplyScalar(L),H.groundColor.copy(A.groundColor).multiplyScalar(L),n.hemi[_]=H,_++}}C>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ve.LTC_FLOAT_1,n.rectAreaLTC2=ve.LTC_FLOAT_2):(n.rectAreaLTC1=ve.LTC_HALF_1,n.rectAreaLTC2=ve.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=p,n.ambient[2]=f;let I=n.hash;(I.sunLength!==h||I.directionalLength!==m||I.pointLength!==d||I.spotLength!==w||I.rectAreaLength!==C||I.hemiLength!==_||I.numSunShadows!==g||I.numDirectionalShadows!==b||I.numPointShadows!==y||I.numSpotShadows!==M||I.numSpotMaps!==x||I.numLightProbes!==R)&&(n.sun.length=h,n.directional.length=m,n.spot.length=w,n.rectArea.length=C,n.point.length=d,n.hemi.length=_,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=T,n.sunShadowCascade.length=T,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.directionalShadowMatrix.length=b,n.pointShadow.length=y,n.pointShadowMap.length=y,n.pointShadowMatrix.length=y,n.spotShadow.length=M,n.spotShadowMap.length=M,n.spotLightMatrix.length=M+x-E,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=R,I.sunLength=h,I.directionalLength=m,I.pointLength=d,I.spotLength=w,I.rectAreaLength=C,I.hemiLength=_,I.numSunShadows=g,I.numDirectionalShadows=b,I.numPointShadows=y,I.numSpotShadows=M,I.numSpotMaps=x,I.numLightProbes=R,n.version=vg++)}function l(c,u){let p=0,f=0,h=0,g=0,T=0,m=0,d=u.matrixWorldInverse;for(let w=0,C=c.length;w<C;w++){let _=c[w];if(_.isSunLight){let b=n.sun[p];b.direction.setFromMatrixPosition(_.matrixWorld),b.direction.transformDirection(d),p++}else if(_.isDirectionalLight){let b=n.directional[f];b.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(d),f++}else if(_.isSpotLight){let b=n.spot[g];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(d),b.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(d),g++}else if(_.isRectAreaLight){let b=n.rectArea[T];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(d),r.identity(),a.copy(_.matrixWorld),a.premultiply(d),r.extractRotation(a),b.halfWidth.set(_.width*.5,0,0),b.halfHeight.set(0,_.height*.5,0),b.halfWidth.applyMatrix4(r),b.halfHeight.applyMatrix4(r),T++}else if(_.isPointLight){let b=n.point[h];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(d),h++}else if(_.isHemisphereLight){let b=n.hemi[m];b.direction.setFromMatrixPosition(_.matrixWorld),b.direction.transformDirection(d),m++}}}return{setup:o,setupView:l,state:n}}function Id(i){let e=new yg(i),t=[],n=[],s=[];function a(f){p.camera=f,t.length=0,n.length=0,s.length=0}function r(f){t.push(f)}function o(f){n.push(f)}function l(f){s.push(f)}function c(){e.setup(t)}function u(f){e.setupView(t,f)}let p={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:u,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function bg(i){let e=new WeakMap;function t(s,a=0){let r=e.get(s),o;return r===void 0?(o=new Id(i),e.set(s,[o])):a>=r.length?(o=new Id(i),r.push(o)):o=r[a],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Sg=`void main() {
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
}`,wg=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],Tg=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],Pd=new gt,na=new k,Ol=new k;function Eg(i,e,t){let n=new Oi,s=new xe,a=new xe,r=new xt,o=new er,l=new tr,c={},u=t.maxTextureSize,p={[Yn]:Gt,[Gt]:Yn,[Ot]:Ot},f=new jt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new xe},radius:{value:4}},vertexShader:Sg,fragmentShader:Mg}),h=f.clone();h.defines.HORIZONTAL_PASS=1;let g=new Ft;g.setAttribute("position",new sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let T=new Xt(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xs;let d=this.type;this.render=function(y,M,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||y.length===0)return;this.type===mr&&(De("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Xs);let E=i.getRenderTarget(),R=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Sn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let O=d!==this.type;O&&M.traverse(function(A){A.material&&(Array.isArray(A.material)?A.material.forEach(D=>D.needsUpdate=!0):A.material.needsUpdate=!0)});for(let A=0,D=y.length;A<D;A++){let L=y[A],V=L.shadow;if(V===void 0){De("WebGLShadowMap:",L,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let X=V.getFrameExtents();s.multiply(X),a.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(a.x=Math.floor(u/X.x),s.x=a.x*X.x,V.mapSize.x=a.x),s.y>u&&(a.y=Math.floor(u/X.y),s.y=a.y*X.y,V.mapSize.y=a.y));let H=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=H,V.map===null||O===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Yi){if(L.isPointLight){De("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new Wt(s.x,s.y,{format:jn,type:pn,minFilter:Nt,magFilter:Nt,generateMipmaps:!1}),V.map.texture.name=L.name+".shadowMap",V.map.depthTexture=new Wn(s.x,s.y,fn),V.map.depthTexture.name=L.name+".shadowMapDepth",V.map.depthTexture.format=_n,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ct,V.map.depthTexture.magFilter=Ct}else L.isPointLight?(V.map=new oo(s.x),V.map.depthTexture=new Ya(s.x,un)):(V.map=new Wt(s.x,s.y),V.map.depthTexture=new Wn(s.x,s.y,un)),V.map.depthTexture.name=L.name+".shadowMap",V.map.depthTexture.format=_n,this.type===Xs?(V.map.depthTexture.compareFunction=H?io:no,V.map.depthTexture.minFilter=Nt,V.map.depthTexture.magFilter=Nt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ct,V.map.depthTexture.magFilter=Ct);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let U=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();L.isPointLight!==!0&&V.updateMatrices(L,x);for(let J=0;J<U;J++){let Y=V.getCamera(J);if(L.isPointLight){let ae=V.camera,Pe=V.matrix,Ee=L.distance||ae.far;Ee!==ae.far&&(ae.far=Ee,ae.updateProjectionMatrix()),na.setFromMatrixPosition(L.matrixWorld),ae.position.copy(na),Ol.copy(ae.position),Ol.add(wg[J]),ae.up.copy(Tg[J]),ae.lookAt(Ol),ae.updateMatrixWorld(),Pe.makeTranslation(-na.x,-na.y,-na.z),Pd.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Pd,ae.coordinateSystem,ae.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,J),i.clear();else{J===0&&(i.setRenderTarget(V.map),i.clear());let ae=V.getViewport(J);r.set(a.x*ae.x,a.y*ae.y,a.x*ae.z,a.y*ae.w),N.viewport(r)}n=V.getFrustum(J),_(M,x,Y,L,this.type)}V.isPointLightShadow!==!0&&this.type===Yi&&w(V,x),V.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(E,R,I)};function w(y,M){let x=e.update(T);f.defines.VSM_SAMPLES!==y.blurSamples&&(f.defines.VSM_SAMPLES=y.blurSamples,h.defines.VSM_SAMPLES=y.blurSamples,f.needsUpdate=!0,h.needsUpdate=!0),y.mapPass===null?y.mapPass=new Wt(s.x,s.y,{format:jn,type:pn}):(y.mapPass.width!==y.map.width||y.mapPass.height!==y.map.height)&&y.mapPass.setSize(y.map.width,y.map.height),f.uniforms.shadow_pass.value=y.map.depthTexture,f.uniforms.resolution.value.set(y.map.width,y.map.height),f.uniforms.radius.value=y.radius,i.setRenderTarget(y.mapPass),i.clear(),i.renderBufferDirect(M,null,x,f,T,null),h.uniforms.shadow_pass.value=y.mapPass.texture,h.uniforms.resolution.value.set(y.map.width,y.map.height),h.uniforms.radius.value=y.radius,i.setRenderTarget(y.map),i.clear(),i.renderBufferDirect(M,null,x,h,T,null)}function C(y,M,x,E){let R=null,I=x.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,i.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){let N=R.uuid,O=M.uuid,A=c[N];A===void 0&&(A={},c[N]=A);let D=A[O];D===void 0&&(D=R.clone(),A[O]=D,M.addEventListener("dispose",b)),R=D}if(R.visible=M.visible,R.wireframe=M.wireframe,E===Yi?R.side=M.shadowSide!==null?M.shadowSide:M.side:R.side=M.shadowSide!==null?M.shadowSide:p[M.side],R.alphaMap=M.alphaMap,R.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,R.map=M.map,R.clipShadows=M.clipShadows,R.clippingPlanes=M.clippingPlanes,R.clipIntersection=M.clipIntersection,R.displacementMap=M.displacementMap,R.displacementScale=M.displacementScale,R.displacementBias=M.displacementBias,R.wireframeLinewidth=M.wireframeLinewidth,R.linewidth=M.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let N=i.properties.get(R);N.light=x}return R}function _(y,M,x,E,R){if(y.visible===!1)return;if(y.layers.test(M.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&R===Yi)&&(!y.frustumCulled||y.intersectsFrustum(n))){y.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,y.matrixWorld);let O=e.update(y),A=y.material;if(Array.isArray(A)){let D=O.groups;for(let L=0,V=D.length;L<V;L++){let X=D[L],H=A[X.materialIndex];if(H&&H.visible){let U=C(y,H,E,R);y.onBeforeShadow(i,y,M,x,O,U,X),i.renderBufferDirect(x,null,O,U,y,X),y.onAfterShadow(i,y,M,x,O,U,X)}}}else if(A.visible){let D=C(y,A,E,R);y.onBeforeShadow(i,y,M,x,O,D,null),i.renderBufferDirect(x,null,O,D,y,null),y.onAfterShadow(i,y,M,x,O,D,null)}}let N=y.children;for(let O=0,A=N.length;O<A;O++)_(N[O],M,x,E,R)}function b(y){y.target.removeEventListener("dispose",b);for(let x in c){let E=c[x],R=y.target.uuid;R in E&&(E[R].dispose(),delete E[R])}}}function Ag(i,e){function t(){let B=!1,fe=new xt,te=null,pe=new xt(0,0,0,0);return{setMask:function(oe){te!==oe&&!B&&(i.colorMask(oe,oe,oe,oe),te=oe)},setLocked:function(oe){B=oe},setClear:function(oe,se,ie,re,Le){Le===!0&&(oe*=re,se*=re,ie*=re),fe.set(oe,se,ie,re),pe.equals(fe)===!1&&(i.clearColor(oe,se,ie,re),pe.copy(fe))},reset:function(){B=!1,te=null,pe.set(-1,0,0,0)}}}function n(){let B=!1,fe=!1,te=null,pe=null,oe=null;return{setReversed:function(se){if(fe!==se){let ie=e.get("EXT_clip_control");se?ie.clipControlEXT(ie.LOWER_LEFT_EXT,ie.ZERO_TO_ONE_EXT):ie.clipControlEXT(ie.LOWER_LEFT_EXT,ie.NEGATIVE_ONE_TO_ONE_EXT),fe=se;let re=oe;oe=null,this.setClear(re)}},getReversed:function(){return fe},setTest:function(se){se?j(i.DEPTH_TEST):ce(i.DEPTH_TEST)},setMask:function(se){te!==se&&!B&&(i.depthMask(se),te=se)},setFunc:function(se){if(fe&&(se=id[se]),pe!==se){switch(se){case Pa:i.depthFunc(i.NEVER);break;case La:i.depthFunc(i.ALWAYS);break;case Da:i.depthFunc(i.LESS);break;case Ii:i.depthFunc(i.LEQUAL);break;case Ua:i.depthFunc(i.EQUAL);break;case Fa:i.depthFunc(i.GEQUAL);break;case Oa:i.depthFunc(i.GREATER);break;case Ba:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=se}},setLocked:function(se){B=se},setClear:function(se){oe!==se&&(oe=se,fe&&(se=1-se),i.clearDepth(se))},reset:function(){B=!1,te=null,pe=null,oe=null,fe=!1}}}function s(){let B=!1,fe=null,te=null,pe=null,oe=null,se=null,ie=null,re=null,Le=null;return{setTest:function(Be){B||(Be?j(i.STENCIL_TEST):ce(i.STENCIL_TEST))},setMask:function(Be){fe!==Be&&!B&&(i.stencilMask(Be),fe=Be)},setFunc:function(Be,it,mt){(te!==Be||pe!==it||oe!==mt)&&(i.stencilFunc(Be,it,mt),te=Be,pe=it,oe=mt)},setOp:function(Be,it,mt){(se!==Be||ie!==it||re!==mt)&&(i.stencilOp(Be,it,mt),se=Be,ie=it,re=mt)},setLocked:function(Be){B=Be},setClear:function(Be){Le!==Be&&(i.clearStencil(Be),Le=Be)},reset:function(){B=!1,fe=null,te=null,pe=null,oe=null,se=null,ie=null,re=null,Le=null}}}let a=new t,r=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},p={},f={},h=new WeakMap,g=[],T=null,m=!1,d=null,w=null,C=null,_=null,b=null,y=null,M=null,x=new Ye(0,0,0),E=0,R=!1,I=null,N=null,O=null,A=null,D=null,L=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,X=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(H)[1]),V=X>=1):H.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),V=X>=2);let U=null,J={},Y=i.getParameter(i.SCISSOR_BOX),ae=i.getParameter(i.VIEWPORT),Pe=new xt().fromArray(Y),Ee=new xt().fromArray(ae);function we(B,fe,te,pe){let oe=new Uint8Array(4),se=i.createTexture();i.bindTexture(B,se),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ie=0;ie<te;ie++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(fe,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(fe+ie,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return se}let K={};K[i.TEXTURE_2D]=we(i.TEXTURE_2D,i.TEXTURE_2D,1),K[i.TEXTURE_CUBE_MAP]=we(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[i.TEXTURE_2D_ARRAY]=we(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),K[i.TEXTURE_3D]=we(i.TEXTURE_3D,i.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),j(i.DEPTH_TEST),r.setFunc(Ii),Ge(!1),Ze(Qo),j(i.CULL_FACE),We(Sn);function j(B){u[B]!==!0&&(i.enable(B),u[B]=!0)}function ce(B){u[B]!==!1&&(i.disable(B),u[B]=!1)}function be(B,fe){return f[B]!==fe?(i.bindFramebuffer(B,fe),f[B]=fe,B===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=fe),B===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=fe),!0):!1}function ge(B,fe){let te=g,pe=!1;if(B){te=h.get(fe),te===void 0&&(te=[],h.set(fe,te));let oe=B.textures;if(te.length!==oe.length||te[0]!==i.COLOR_ATTACHMENT0){for(let se=0,ie=oe.length;se<ie;se++)te[se]=i.COLOR_ATTACHMENT0+se;te.length=oe.length,pe=!0}}else te[0]!==i.BACK&&(te[0]=i.BACK,pe=!0);pe&&i.drawBuffers(te)}function Oe(B){return T!==B?(i.useProgram(B),T=B,!0):!1}let dt={[li]:i.FUNC_ADD,[wc]:i.FUNC_SUBTRACT,[Tc]:i.FUNC_REVERSE_SUBTRACT};dt[Ec]=i.MIN,dt[Ac]=i.MAX;let ze={[Cc]:i.ZERO,[Rc]:i.ONE,[Nc]:i.SRC_COLOR,[il]:i.SRC_ALPHA,[Fc]:i.SRC_ALPHA_SATURATE,[Dc]:i.DST_COLOR,[Pc]:i.DST_ALPHA,[Ic]:i.ONE_MINUS_SRC_COLOR,[sl]:i.ONE_MINUS_SRC_ALPHA,[Uc]:i.ONE_MINUS_DST_COLOR,[Lc]:i.ONE_MINUS_DST_ALPHA,[Oc]:i.CONSTANT_COLOR,[Bc]:i.ONE_MINUS_CONSTANT_COLOR,[kc]:i.CONSTANT_ALPHA,[zc]:i.ONE_MINUS_CONSTANT_ALPHA};function We(B,fe,te,pe,oe,se,ie,re,Le,Be){if(B===Sn){m===!0&&(ce(i.BLEND),m=!1);return}if(m===!1&&(j(i.BLEND),m=!0),B!==Mc){if(B!==d||Be!==R){if((w!==li||b!==li)&&(i.blendEquation(i.FUNC_ADD),w=li,b=li),Be)switch(B){case Zi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFunc(i.ONE,i.ONE);break;case tl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case nl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Fe("WebGLState: Invalid blending: ",B);break}else switch(B){case Zi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case tl:Fe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nl:Fe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Fe("WebGLState: Invalid blending: ",B);break}C=null,_=null,y=null,M=null,x.set(0,0,0),E=0,d=B,R=Be}return}oe=oe||fe,se=se||te,ie=ie||pe,(fe!==w||oe!==b)&&(i.blendEquationSeparate(dt[fe],dt[oe]),w=fe,b=oe),(te!==C||pe!==_||se!==y||ie!==M)&&(i.blendFuncSeparate(ze[te],ze[pe],ze[se],ze[ie]),C=te,_=pe,y=se,M=ie),(re.equals(x)===!1||Le!==E)&&(i.blendColor(re.r,re.g,re.b,Le),x.copy(re),E=Le),d=B,R=!1}function je(B,fe){B.side===Ot?ce(i.CULL_FACE):j(i.CULL_FACE);let te=B.side===Gt;fe&&(te=!te),Ge(te),B.blending===Zi&&B.transparent===!1?We(Sn):We(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),r.setFunc(B.depthFunc),r.setTest(B.depthTest),r.setMask(B.depthWrite),a.setMask(B.colorWrite);let pe=B.stencilWrite;o.setTest(pe),pe&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),ot(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):ce(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(B){I!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),I=B)}function Ze(B){B!==bc?(j(i.CULL_FACE),B!==N&&(B===Qo?i.cullFace(i.BACK):B===Sc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ce(i.CULL_FACE),N=B}function ht(B){B!==O&&(V&&i.lineWidth(B),O=B)}function ot(B,fe,te){B?(j(i.POLYGON_OFFSET_FILL),(A!==fe||D!==te)&&(A=fe,D=te,r.getReversed()&&(fe=-fe),i.polygonOffset(fe,te))):ce(i.POLYGON_OFFSET_FILL)}function nt(B){B?j(i.SCISSOR_TEST):ce(i.SCISSOR_TEST)}function tt(B){B===void 0&&(B=i.TEXTURE0+L-1),U!==B&&(i.activeTexture(B),U=B)}function z(B,fe,te){te===void 0&&(U===null?te=i.TEXTURE0+L-1:te=U);let pe=J[te];pe===void 0&&(pe={type:void 0,texture:void 0},J[te]=pe),(pe.type!==B||pe.texture!==fe)&&(U!==te&&(i.activeTexture(te),U=te),i.bindTexture(B,fe||K[B]),pe.type=B,pe.texture=fe)}function He(){let B=J[U];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function Ve(){try{i.compressedTexImage2D(...arguments)}catch(B){Fe("WebGLState:",B)}}function P(){try{i.compressedTexImage3D(...arguments)}catch(B){Fe("WebGLState:",B)}}function v(){try{i.texSubImage2D(...arguments)}catch(B){Fe("WebGLState:",B)}}function G(){try{i.texSubImage3D(...arguments)}catch(B){Fe("WebGLState:",B)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(B){Fe("WebGLState:",B)}}function ee(){try{i.compressedTexSubImage3D(...arguments)}catch(B){Fe("WebGLState:",B)}}function le(){try{i.texStorage2D(...arguments)}catch(B){Fe("WebGLState:",B)}}function de(){try{i.texStorage3D(...arguments)}catch(B){Fe("WebGLState:",B)}}function Q(){try{i.texImage2D(...arguments)}catch(B){Fe("WebGLState:",B)}}function ne(){try{i.texImage3D(...arguments)}catch(B){Fe("WebGLState:",B)}}function me(B){return p[B]!==void 0?p[B]:i.getParameter(B)}function Se(B,fe){p[B]!==fe&&(i.pixelStorei(B,fe),p[B]=fe)}function he(B){Pe.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),Pe.copy(B))}function ue(B){Ee.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),Ee.copy(B))}function Ae(B,fe){let te=c.get(fe);te===void 0&&(te=new WeakMap,c.set(fe,te));let pe=te.get(B);pe===void 0&&(pe=i.getUniformBlockIndex(fe,B.name),te.set(B,pe))}function Ie(B,fe){let pe=c.get(fe).get(B);l.get(fe)!==pe&&(i.uniformBlockBinding(fe,pe,B.__bindingPointIndex),l.set(fe,pe))}function Ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),r.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},p={},U=null,J={},f={},h=new WeakMap,g=[],T=null,m=!1,d=null,w=null,C=null,_=null,b=null,y=null,M=null,x=new Ye(0,0,0),E=0,R=!1,I=null,N=null,O=null,A=null,D=null,Pe.set(0,0,i.canvas.width,i.canvas.height),Ee.set(0,0,i.canvas.width,i.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:j,disable:ce,bindFramebuffer:be,drawBuffers:ge,useProgram:Oe,setBlending:We,setMaterial:je,setFlipSided:Ge,setCullFace:Ze,setLineWidth:ht,setPolygonOffset:ot,setScissorTest:nt,activeTexture:tt,bindTexture:z,unbindTexture:He,compressedTexImage2D:Ve,compressedTexImage3D:P,texImage2D:Q,texImage3D:ne,pixelStorei:Se,getParameter:me,updateUBOMapping:Ae,uniformBlockBinding:Ie,texStorage2D:le,texStorage3D:de,texSubImage2D:v,texSubImage3D:G,compressedTexSubImage2D:W,compressedTexSubImage3D:ee,scissor:he,viewport:ue,reset:Ue}}function Cg(i,e,t,n,s,a,r){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new xe,u=new WeakMap,p=new Set,f,h=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(P,v){return g?new OffscreenCanvas(P,v):ms("canvas")}function m(P,v,G){let W=1,ee=Ve(P);if((ee.width>G||ee.height>G)&&(W=G/Math.max(ee.width,ee.height)),W<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let le=Math.floor(W*ee.width),de=Math.floor(W*ee.height);f===void 0&&(f=T(le,de));let Q=v?T(le,de):f;return Q.width=le,Q.height=de,Q.getContext("2d").drawImage(P,0,0,le,de),De("WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+le+"x"+de+")."),Q}else return"data"in P&&De("WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),P;return P}function d(P){return P.generateMipmaps}function w(P){i.generateMipmap(P)}function C(P){return P.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?i.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function _(P,v,G,W,ee,le=!1){if(P!==null){if(i[P]!==void 0)return i[P];De("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let de;W&&(de=e.get("EXT_texture_norm16"),de||De("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=v;if(v===i.RED&&(G===i.FLOAT&&(Q=i.R32F),G===i.HALF_FLOAT&&(Q=i.R16F),G===i.UNSIGNED_BYTE&&(Q=i.R8),G===i.UNSIGNED_SHORT&&de&&(Q=de.R16_EXT),G===i.SHORT&&de&&(Q=de.R16_SNORM_EXT)),v===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.R8UI),G===i.UNSIGNED_SHORT&&(Q=i.R16UI),G===i.UNSIGNED_INT&&(Q=i.R32UI),G===i.BYTE&&(Q=i.R8I),G===i.SHORT&&(Q=i.R16I),G===i.INT&&(Q=i.R32I)),v===i.RG&&(G===i.FLOAT&&(Q=i.RG32F),G===i.HALF_FLOAT&&(Q=i.RG16F),G===i.UNSIGNED_BYTE&&(Q=i.RG8),G===i.UNSIGNED_SHORT&&de&&(Q=de.RG16_EXT),G===i.SHORT&&de&&(Q=de.RG16_SNORM_EXT)),v===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RG8UI),G===i.UNSIGNED_SHORT&&(Q=i.RG16UI),G===i.UNSIGNED_INT&&(Q=i.RG32UI),G===i.BYTE&&(Q=i.RG8I),G===i.SHORT&&(Q=i.RG16I),G===i.INT&&(Q=i.RG32I)),v===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),G===i.UNSIGNED_INT&&(Q=i.RGB32UI),G===i.BYTE&&(Q=i.RGB8I),G===i.SHORT&&(Q=i.RGB16I),G===i.INT&&(Q=i.RGB32I)),v===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),G===i.UNSIGNED_INT&&(Q=i.RGBA32UI),G===i.BYTE&&(Q=i.RGBA8I),G===i.SHORT&&(Q=i.RGBA16I),G===i.INT&&(Q=i.RGBA32I)),v===i.RGB&&(G===i.UNSIGNED_SHORT&&de&&(Q=de.RGB16_EXT),G===i.SHORT&&de&&(Q=de.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),v===i.RGBA){let ne=le?ps:Ke.getTransfer(ee);G===i.FLOAT&&(Q=i.RGBA32F),G===i.HALF_FLOAT&&(Q=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Q=ne===at?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&de&&(Q=de.RGBA16_EXT),G===i.SHORT&&de&&(Q=de.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function b(P,v){let G;return P?v===null||v===un||v===Ki?G=i.DEPTH24_STENCIL8:v===fn?G=i.DEPTH32F_STENCIL8:v===Ji&&(G=i.DEPTH24_STENCIL8,De("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===un||v===Ki?G=i.DEPTH_COMPONENT24:v===fn?G=i.DEPTH_COMPONENT32F:v===Ji&&(G=i.DEPTH_COMPONENT16),G}function y(P,v){return d(P)===!0||P.isFramebufferTexture&&P.minFilter!==Ct&&P.minFilter!==Nt?Math.log2(Math.max(v.width,v.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?v.mipmaps.length:1}function M(P){let v=P.target;v.removeEventListener("dispose",M),E(v),v.isVideoTexture&&u.delete(v),v.isHTMLTexture&&p.delete(v)}function x(P){let v=P.target;v.removeEventListener("dispose",x),I(v)}function E(P){let v=n.get(P);if(v.__webglInit===void 0)return;let G=P.source,W=h.get(G);if(W){let ee=W[v.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&R(P),Object.keys(W).length===0&&h.delete(G)}n.remove(P)}function R(P){let v=n.get(P);i.deleteTexture(v.__webglTexture);let G=P.source,W=h.get(G);delete W[v.__cacheKey],r.memory.textures--}function I(P){let v=n.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),n.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(v.__webglFramebuffer[W]))for(let ee=0;ee<v.__webglFramebuffer[W].length;ee++)i.deleteFramebuffer(v.__webglFramebuffer[W][ee]);else i.deleteFramebuffer(v.__webglFramebuffer[W]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[W])}else{if(Array.isArray(v.__webglFramebuffer))for(let W=0;W<v.__webglFramebuffer.length;W++)i.deleteFramebuffer(v.__webglFramebuffer[W]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let W=0;W<v.__webglColorRenderbuffer.length;W++)v.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[W]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let G=P.textures;for(let W=0,ee=G.length;W<ee;W++){let le=n.get(G[W]);le.__webglTexture&&(i.deleteTexture(le.__webglTexture),r.memory.textures--),n.remove(G[W])}n.remove(P)}let N=0;function O(){N=0}function A(){return N}function D(P){N=P}function L(){let P=N;return P>=s.maxTextures&&De("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+s.maxTextures),N+=1,P}function V(P){let v=[];return v.push(P.wrapS),v.push(P.wrapT),v.push(P.wrapR||0),v.push(P.magFilter),v.push(P.minFilter),v.push(P.anisotropy),v.push(P.internalFormat),v.push(P.format),v.push(P.type),v.push(P.generateMipmaps),v.push(P.premultiplyAlpha),v.push(P.flipY),v.push(P.unpackAlignment),v.push(P.colorSpace),v.join()}function X(P,v){let G=n.get(P);if(P.isVideoTexture&&z(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&G.__version!==P.version){let W=P.image;if(W===null)De("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)De("WebGLRenderer: Texture marked for update but image is incomplete");else{ce(G,P,v);return}}else P.isExternalTexture&&(G.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+v)}function H(P,v){let G=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&G.__version!==P.version){ce(G,P,v);return}else P.isExternalTexture&&(G.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+v)}function U(P,v){let G=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&G.__version!==P.version){ce(G,P,v);return}t.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+v)}function J(P,v){let G=n.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&G.__version!==P.version){be(G,P,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+v)}let Y={[ka]:i.REPEAT,[vn]:i.CLAMP_TO_EDGE,[za]:i.MIRRORED_REPEAT},ae={[Ct]:i.NEAREST,[Hc]:i.NEAREST_MIPMAP_NEAREST,[Ys]:i.NEAREST_MIPMAP_LINEAR,[Nt]:i.LINEAR,[vr]:i.LINEAR_MIPMAP_NEAREST,[Jn]:i.LINEAR_MIPMAP_LINEAR},Pe={[$c]:i.NEVER,[jc]:i.ALWAYS,[Yc]:i.LESS,[no]:i.LEQUAL,[Zc]:i.EQUAL,[io]:i.GEQUAL,[Jc]:i.GREATER,[Kc]:i.NOTEQUAL};function Ee(P,v){if(v.type===fn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Nt||v.magFilter===vr||v.magFilter===Ys||v.magFilter===Jn||v.minFilter===Nt||v.minFilter===vr||v.minFilter===Ys||v.minFilter===Jn)&&De("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(P,i.TEXTURE_WRAP_S,Y[v.wrapS]),i.texParameteri(P,i.TEXTURE_WRAP_T,Y[v.wrapT]),(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)&&i.texParameteri(P,i.TEXTURE_WRAP_R,Y[v.wrapR]),i.texParameteri(P,i.TEXTURE_MAG_FILTER,ae[v.magFilter]),i.texParameteri(P,i.TEXTURE_MIN_FILTER,ae[v.minFilter]),v.compareFunction&&(i.texParameteri(P,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(P,i.TEXTURE_COMPARE_FUNC,Pe[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Ct||v.minFilter!==Ys&&v.minFilter!==Jn||v.type===fn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let G=e.get("EXT_texture_filter_anisotropic");i.texParameterf(P,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function we(P,v){let G=!1;P.__webglInit===void 0&&(P.__webglInit=!0,v.addEventListener("dispose",M));let W=v.source,ee=h.get(W);ee===void 0&&(ee={},h.set(W,ee));let le=V(v);if(le!==P.__cacheKey){ee[le]===void 0&&(ee[le]={texture:i.createTexture(),usedTimes:0},r.memory.textures++,G=!0),ee[le].usedTimes++;let de=ee[P.__cacheKey];de!==void 0&&(ee[P.__cacheKey].usedTimes--,de.usedTimes===0&&R(v)),P.__cacheKey=le,P.__webglTexture=ee[le].texture}return G}function K(P,v,G){return Math.floor(Math.floor(P/G)/v)}function j(P,v,G,W){let le=P.updateRanges;if(le.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,G,W,v.data);else{le.sort((Se,he)=>Se.start-he.start);let de=0;for(let Se=1;Se<le.length;Se++){let he=le[de],ue=le[Se],Ae=he.start+he.count,Ie=K(ue.start,v.width,4),Ue=K(he.start,v.width,4);ue.start<=Ae+1&&Ie===Ue&&K(ue.start+ue.count-1,v.width,4)===Ie?he.count=Math.max(he.count,ue.start+ue.count-he.start):(++de,le[de]=ue)}le.length=de+1;let Q=t.getParameter(i.UNPACK_ROW_LENGTH),ne=t.getParameter(i.UNPACK_SKIP_PIXELS),me=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let Se=0,he=le.length;Se<he;Se++){let ue=le[Se],Ae=Math.floor(ue.start/4),Ie=Math.ceil(ue.count/4),Ue=Ae%v.width,B=Math.floor(Ae/v.width),fe=Ie,te=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Ue),t.pixelStorei(i.UNPACK_SKIP_ROWS,B),t.texSubImage2D(i.TEXTURE_2D,0,Ue,B,fe,te,G,W,v.data)}P.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(i.UNPACK_SKIP_ROWS,me)}}function ce(P,v,G){let W=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(W=i.TEXTURE_3D);let ee=we(P,v),le=v.source;t.bindTexture(W,P.__webglTexture,i.TEXTURE0+G);let de=n.get(le);if(le.version!==de.__version||ee===!0){if(t.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let te=Ke.getPrimaries(Ke.workingColorSpace),pe=v.colorSpace===Pn?null:Ke.getPrimaries(v.colorSpace),oe=v.colorSpace===Pn||te===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,oe)}t.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment);let ne=m(v.image,!1,s.maxTextureSize);ne=He(v,ne);let me=a.convert(v.format,v.colorSpace),Se=a.convert(v.type),he=_(v.internalFormat,me,Se,v.normalized,v.colorSpace,v.isVideoTexture);Ee(W,v);let ue,Ae=v.mipmaps,Ie=v.isVideoTexture!==!0,Ue=de.__version===void 0||ee===!0,B=le.dataReady,fe=y(v,ne);if(v.isDepthTexture)he=b(v.format===Kn,v.type),Ue&&(Ie?t.texStorage2D(i.TEXTURE_2D,1,he,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,he,ne.width,ne.height,0,me,Se,null));else if(v.isDataTexture)if(Ae.length>0){Ie&&Ue&&t.texStorage2D(i.TEXTURE_2D,fe,he,Ae[0].width,Ae[0].height);for(let te=0,pe=Ae.length;te<pe;te++)ue=Ae[te],Ie?B&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,me,Se,ue.data):t.texImage2D(i.TEXTURE_2D,te,he,ue.width,ue.height,0,me,Se,ue.data);v.generateMipmaps=!1}else Ie?(Ue&&t.texStorage2D(i.TEXTURE_2D,fe,he,ne.width,ne.height),B&&j(v,ne,me,Se)):t.texImage2D(i.TEXTURE_2D,0,he,ne.width,ne.height,0,me,Se,ne.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Ie&&Ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,he,Ae[0].width,Ae[0].height,ne.depth);for(let te=0,pe=Ae.length;te<pe;te++)if(ue=Ae[te],v.format!==an)if(me!==null)if(Ie){if(B)if(v.layerUpdates.size>0){let oe=El(ue.width,ue.height,v.format,v.type);for(let se of v.layerUpdates){let ie=ue.data.subarray(se*oe/ue.data.BYTES_PER_ELEMENT,(se+1)*oe/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,se,ue.width,ue.height,1,me,ie)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,ue.width,ue.height,ne.depth,me,ue.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,te,he,ue.width,ue.height,ne.depth,0,ue.data,0,0);else De("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ie?B&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,ue.width,ue.height,ne.depth,me,Se,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,te,he,ue.width,ue.height,ne.depth,0,me,Se,ue.data);v.layerUpdates.size>0&&v.clearLayerUpdates()}else{Ie&&Ue&&t.texStorage2D(i.TEXTURE_2D,fe,he,Ae[0].width,Ae[0].height);for(let te=0,pe=Ae.length;te<pe;te++)ue=Ae[te],v.format!==an?me!==null?Ie?B&&t.compressedTexSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,me,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,te,he,ue.width,ue.height,0,ue.data):De("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ie?B&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,me,Se,ue.data):t.texImage2D(i.TEXTURE_2D,te,he,ue.width,ue.height,0,me,Se,ue.data)}else if(v.isDataArrayTexture)if(Ie){if(Ue&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,he,ne.width,ne.height,ne.depth),B)if(v.layerUpdates.size>0){let te=El(ne.width,ne.height,v.format,v.type);for(let pe of v.layerUpdates){let oe=ne.data.subarray(pe*te/ne.data.BYTES_PER_ELEMENT,(pe+1)*te/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,pe,ne.width,ne.height,1,me,Se,oe)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,me,Se,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,he,ne.width,ne.height,ne.depth,0,me,Se,ne.data);else if(v.isData3DTexture)Ie?(Ue&&t.texStorage3D(i.TEXTURE_3D,fe,he,ne.width,ne.height,ne.depth),B&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,me,Se,ne.data)):t.texImage3D(i.TEXTURE_3D,0,he,ne.width,ne.height,ne.depth,0,me,Se,ne.data);else if(v.isFramebufferTexture){if(Ue)if(Ie)t.texStorage2D(i.TEXTURE_2D,fe,he,ne.width,ne.height);else{let te=ne.width,pe=ne.height;for(let oe=0;oe<fe;oe++)t.texImage2D(i.TEXTURE_2D,oe,he,te,pe,0,me,Se,null),te>>=1,pe>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in i){let te=i.canvas;if(te.hasAttribute("layoutsubtree")||te.setAttribute("layoutsubtree","true"),ne.parentNode!==te){te.appendChild(ne),p.add(v),te.onpaint=pe=>{let oe=pe.changedElements;for(let se of p)oe.includes(se.image)&&(se.needsUpdate=!0)},te.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ne);else{let oe=i.RGBA,se=i.RGBA,ie=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,oe,se,ie,ne)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ae.length>0){if(Ie&&Ue){let te=Ve(Ae[0]);t.texStorage2D(i.TEXTURE_2D,fe,he,te.width,te.height)}for(let te=0,pe=Ae.length;te<pe;te++)ue=Ae[te],Ie?B&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,me,Se,ue):t.texImage2D(i.TEXTURE_2D,te,he,me,Se,ue);v.generateMipmaps=!1}else if(Ie){if(Ue){let te=Ve(ne);t.texStorage2D(i.TEXTURE_2D,fe,he,te.width,te.height)}B&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,Se,ne)}else t.texImage2D(i.TEXTURE_2D,0,he,me,Se,ne);d(v)&&w(W),de.__version=le.version,v.onUpdate&&v.onUpdate(v)}P.__version=v.version}function be(P,v,G){if(v.image.length!==6)return;let W=we(P,v),ee=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture,i.TEXTURE0+G);let le=n.get(ee);if(ee.version!==le.__version||W===!0){t.activeTexture(i.TEXTURE0+G);let de=Ke.getPrimaries(Ke.workingColorSpace),Q=v.colorSpace===Pn?null:Ke.getPrimaries(v.colorSpace),ne=v.colorSpace===Pn||de===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);let me=v.isCompressedTexture||v.image[0].isCompressedTexture,Se=v.image[0]&&v.image[0].isDataTexture,he=[];for(let se=0;se<6;se++)!me&&!Se?he[se]=m(v.image[se],!0,s.maxCubemapSize):he[se]=Se?v.image[se].image:v.image[se],he[se]=He(v,he[se]);let ue=he[0],Ae=a.convert(v.format,v.colorSpace),Ie=a.convert(v.type),Ue=_(v.internalFormat,Ae,Ie,v.normalized,v.colorSpace),B=v.isVideoTexture!==!0,fe=le.__version===void 0||W===!0,te=ee.dataReady,pe=y(v,ue);Ee(i.TEXTURE_CUBE_MAP,v);let oe;if(me){B&&fe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,Ue,ue.width,ue.height);for(let se=0;se<6;se++){oe=he[se].mipmaps;for(let ie=0;ie<oe.length;ie++){let re=oe[ie];v.format!==an?Ae!==null?B?te&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie,0,0,re.width,re.height,Ae,re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie,Ue,re.width,re.height,0,re.data):De("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie,0,0,re.width,re.height,Ae,Ie,re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie,Ue,re.width,re.height,0,Ae,Ie,re.data)}}}else{if(oe=v.mipmaps,B&&fe){oe.length>0&&pe++;let se=Ve(he[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,Ue,se.width,se.height)}for(let se=0;se<6;se++)if(Se){B?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,he[se].width,he[se].height,Ae,Ie,he[se].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,Ue,he[se].width,he[se].height,0,Ae,Ie,he[se].data);for(let ie=0;ie<oe.length;ie++){let Le=oe[ie].image[se].image;B?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie+1,0,0,Le.width,Le.height,Ae,Ie,Le.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie+1,Ue,Le.width,Le.height,0,Ae,Ie,Le.data)}}else{B?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,Ae,Ie,he[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,Ue,Ae,Ie,he[se]);for(let ie=0;ie<oe.length;ie++){let re=oe[ie];B?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie+1,0,0,Ae,Ie,re.image[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ie+1,Ue,Ae,Ie,re.image[se])}}}d(v)&&w(i.TEXTURE_CUBE_MAP),le.__version=ee.version,v.onUpdate&&v.onUpdate(v)}P.__version=v.version}function ge(P,v,G,W,ee,le){let de=a.convert(G.format,G.colorSpace),Q=a.convert(G.type),ne=_(G.internalFormat,de,Q,G.normalized,G.colorSpace),me=n.get(v),Se=n.get(G);if(Se.__renderTarget=v,!me.__hasExternalTextures){let he=Math.max(1,v.width>>le),ue=Math.max(1,v.height>>le);ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?t.texImage3D(ee,le,ne,he,ue,v.depth,0,de,Q,null):t.texImage2D(ee,le,ne,he,ue,0,de,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,P),tt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,ee,Se.__webglTexture,0,nt(v)):(ee===i.TEXTURE_2D||ee>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,ee,Se.__webglTexture,le),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(P,v,G){if(i.bindRenderbuffer(i.RENDERBUFFER,P),v.depthBuffer){let W=v.depthTexture,ee=W&&W.isDepthTexture?W.type:null,le=b(v.stencilBuffer,ee),de=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;tt(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,nt(v),le,v.width,v.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,nt(v),le,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,le,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,P)}else{let W=v.textures;for(let ee=0;ee<W.length;ee++){let le=W[ee],de=a.convert(le.format,le.colorSpace),Q=a.convert(le.type),ne=_(le.internalFormat,de,Q,le.normalized,le.colorSpace);tt(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,nt(v),ne,v.width,v.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,nt(v),ne,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ne,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function dt(P,v,G){let W=v.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,P),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ee=n.get(v.depthTexture);if(ee.__renderTarget=v,(!ee.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),W){if(ee.__webglInit===void 0&&(ee.__webglInit=!0,v.depthTexture.addEventListener("dispose",M)),ee.__webglTexture===void 0){ee.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,ee.__webglTexture),Ee(i.TEXTURE_CUBE_MAP,v.depthTexture);let me=a.convert(v.depthTexture.format),Se=a.convert(v.depthTexture.type),he;v.depthTexture.format===_n?he=i.DEPTH_COMPONENT24:v.depthTexture.format===Kn&&(he=i.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,he,v.width,v.height,0,me,Se,null)}}else X(v.depthTexture,0);let le=ee.__webglTexture,de=nt(v),Q=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,ne=v.depthTexture.format===Kn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(v.depthTexture.format===_n)tt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,Q,le,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ne,Q,le,0);else if(v.depthTexture.format===Kn)tt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,Q,le,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ne,Q,le,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ze(P){let v=n.get(P),G=P.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==P.depthTexture){let W=P.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),W){let ee=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,W.removeEventListener("dispose",ee)};W.addEventListener("dispose",ee),v.__depthDisposeCallback=ee}v.__boundDepthTexture=W}if(P.depthTexture&&!v.__autoAllocateDepthBuffer)if(G)for(let W=0;W<6;W++)dt(v.__webglFramebuffer[W],P,W);else{let W=P.texture.mipmaps;W&&W.length>0?dt(v.__webglFramebuffer[0],P,0):dt(v.__webglFramebuffer,P,0)}else if(G){v.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[W]),v.__webglDepthbuffer[W]===void 0)v.__webglDepthbuffer[W]=i.createRenderbuffer(),Oe(v.__webglDepthbuffer[W],P,!1);else{let ee=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=v.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,le),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,le)}}else{let W=P.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),Oe(v.__webglDepthbuffer,P,!1);else{let ee=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,le),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,le)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function We(P,v,G){let W=n.get(P);v!==void 0&&ge(W.__webglFramebuffer,P,P.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&ze(P)}function je(P){let v=P.texture,G=n.get(P),W=n.get(v);P.addEventListener("dispose",x);let ee=P.textures,le=P.isWebGLCubeRenderTarget===!0,de=ee.length>1;if(de||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=v.version,r.memory.textures++),le){G.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer[Q]=[];for(let ne=0;ne<v.mipmaps.length;ne++)G.__webglFramebuffer[Q][ne]=i.createFramebuffer()}else G.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer=[];for(let Q=0;Q<v.mipmaps.length;Q++)G.__webglFramebuffer[Q]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(de)for(let Q=0,ne=ee.length;Q<ne;Q++){let me=n.get(ee[Q]);me.__webglTexture===void 0&&(me.__webglTexture=i.createTexture(),r.memory.textures++)}if(P.samples>0&&tt(P)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Q=0;Q<ee.length;Q++){let ne=ee[Q];G.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[Q]);let me=a.convert(ne.format,ne.colorSpace),Se=a.convert(ne.type),he=_(ne.internalFormat,me,Se,ne.normalized,ne.colorSpace,P.isXRRenderTarget===!0),ue=nt(P);i.renderbufferStorageMultisample(i.RENDERBUFFER,ue,he,P.width,P.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,G.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),P.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),Oe(G.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(le){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),Ee(i.TEXTURE_CUBE_MAP,v);for(let Q=0;Q<6;Q++)if(v.mipmaps&&v.mipmaps.length>0)for(let ne=0;ne<v.mipmaps.length;ne++)ge(G.__webglFramebuffer[Q][ne],P,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ne);else ge(G.__webglFramebuffer[Q],P,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);d(v)&&w(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let Q=0,ne=ee.length;Q<ne;Q++){let me=ee[Q],Se=n.get(me),he=i.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(he=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(he,Se.__webglTexture),Ee(he,me),ge(G.__webglFramebuffer,P,me,i.COLOR_ATTACHMENT0+Q,he,0),d(me)&&w(he)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(Q=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,W.__webglTexture),Ee(Q,v),v.mipmaps&&v.mipmaps.length>0)for(let ne=0;ne<v.mipmaps.length;ne++)ge(G.__webglFramebuffer[ne],P,v,i.COLOR_ATTACHMENT0,Q,ne);else ge(G.__webglFramebuffer,P,v,i.COLOR_ATTACHMENT0,Q,0);d(v)&&w(Q),t.unbindTexture()}P.depthBuffer&&ze(P)}function Ge(P){let v=P.textures;for(let G=0,W=v.length;G<W;G++){let ee=v[G];if(d(ee)){let le=C(P),de=n.get(ee).__webglTexture;t.bindTexture(le,de),w(le),t.unbindTexture()}}}let Ze=[],ht=[];function ot(P){if(P.samples>0){if(tt(P)===!1){let v=P.textures,G=P.width,W=P.height,ee=i.COLOR_BUFFER_BIT,le=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(P),Q=v.length>1;if(Q)for(let me=0;me<v.length;me++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);let ne=P.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let me=0;me<v.length;me++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ee|=i.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ee|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[me]);let Se=n.get(v[me]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Se,0)}i.blitFramebuffer(0,0,G,W,0,0,G,W,ee,i.NEAREST),l===!0&&(Ze.length=0,ht.length=0,Ze.push(i.COLOR_ATTACHMENT0+me),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&(Ze.push(le),ht.push(le),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ht)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ze))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let me=0;me<v.length;me++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,de.__webglColorRenderbuffer[me]);let Se=n.get(v[me]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,Se,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){let v=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function nt(P){return Math.min(s.maxSamples,P.samples)}function tt(P){let v=n.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function z(P){let v=r.render.frame;u.get(P)!==v&&(u.set(P,v),P.update())}function He(P,v){let G=P.colorSpace,W=P.format,ee=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||G!==fs&&G!==Pn&&(Ke.getTransfer(G)===at?(W!==an||ee!==qt)&&De("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Fe("WebGLTextures: Unsupported texture color space:",G)),v}function Ve(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=L,this.resetTextureUnits=O,this.getTextureUnits=A,this.setTextureUnits=D,this.setTexture2D=X,this.setTexture2DArray=H,this.setTexture3D=U,this.setTextureCube=J,this.rebindTextures=We,this.setupRenderTarget=je,this.updateRenderTargetMipmap=Ge,this.updateMultisampleRenderTarget=ot,this.setupDepthRenderbuffer=ze,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=tt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Rg(i,e){function t(n,s=Pn){let a,r=Ke.getTransfer(s);if(n===qt)return i.UNSIGNED_BYTE;if(n===yr)return i.UNSIGNED_SHORT_4_4_4_4;if(n===br)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ml)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===gl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===fl)return i.BYTE;if(n===pl)return i.SHORT;if(n===Ji)return i.UNSIGNED_SHORT;if(n===_r)return i.INT;if(n===un)return i.UNSIGNED_INT;if(n===fn)return i.FLOAT;if(n===pn)return i.HALF_FLOAT;if(n===xl)return i.ALPHA;if(n===vl)return i.RGB;if(n===an)return i.RGBA;if(n===_n)return i.DEPTH_COMPONENT;if(n===Kn)return i.DEPTH_STENCIL;if(n===_l)return i.RED;if(n===Sr)return i.RED_INTEGER;if(n===jn)return i.RG;if(n===Mr)return i.RG_INTEGER;if(n===wr)return i.RGBA_INTEGER;if(n===Zs||n===Js||n===Ks||n===js)if(r===at)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(n===Zs)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Js)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ks)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===js)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(n===Zs)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Js)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ks)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===js)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Tr||n===Er||n===Ar||n===Cr)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(n===Tr)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Er)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ar)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Cr)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Rr||n===Nr||n===Ir||n===Pr||n===Lr||n===Qs||n===Dr)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(n===Rr||n===Nr)return r===at?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===Ir)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(n===Pr)return a.COMPRESSED_R11_EAC;if(n===Lr)return a.COMPRESSED_SIGNED_R11_EAC;if(n===Qs)return a.COMPRESSED_RG11_EAC;if(n===Dr)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ur||n===Fr||n===Or||n===Br||n===kr||n===zr||n===Gr||n===Vr||n===Hr||n===Wr||n===Xr||n===qr||n===$r||n===Yr)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(n===Ur)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Fr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Or)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Br)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===kr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===zr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Gr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Hr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===qr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===$r)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Yr)return r===at?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Zr||n===Jr||n===Kr)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(n===Zr)return r===at?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Jr)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Kr)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===jr||n===Qr||n===ea||n===eo)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(n===jr)return a.COMPRESSED_RED_RGTC1_EXT;if(n===Qr)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ea)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===eo)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ki?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Ng=`
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

}`,Xl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ws(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new jt({vertexShader:Ng,fragmentShader:Ig,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Xt(new Us(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ql=class extends yn{constructor(e,t){super();let n=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,u=null,p=null,f=null,h=null,g=null,T=typeof XRWebGLBinding<"u",m=new Xl,d={},w=t.getContextAttributes(),C=null,_=null,b=[],y=[],M=new xe,x=null,E=null,R=new Rt;R.viewport=new xt;let I=new Rt;I.viewport=new xt;let N=[R,I],O=new fr,A=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let j=b[K];return j===void 0&&(j=new Ui,b[K]=j),j.getTargetRaySpace()},this.getControllerGrip=function(K){let j=b[K];return j===void 0&&(j=new Ui,b[K]=j),j.getGripSpace()},this.getHand=function(K){let j=b[K];return j===void 0&&(j=new Ui,b[K]=j),j.getHandSpace()};function L(K){let j=y.indexOf(K.inputSource);if(j===-1)return;let ce=b[j];ce!==void 0&&(ce.update(K.inputSource,K.frame,c||r),ce.dispatchEvent({type:K.type,data:K.inputSource}))}function V(){s.removeEventListener("select",L),s.removeEventListener("selectstart",L),s.removeEventListener("selectend",L),s.removeEventListener("squeeze",L),s.removeEventListener("squeezestart",L),s.removeEventListener("squeezeend",L),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",X);for(let K=0;K<b.length;K++){let j=y[K];j!==null&&(y[K]=null,b[K].disconnect(j))}A=null,D=null,m.reset();for(let K in d)delete d[K];if(e.setRenderTarget(C),h=null,f=null,p=null,s=null,_=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(M.width,M.height,!1),E!==null){let K=E.camera;K.fov=E.fov,K.zoom=E.zoom,K.updateProjectionMatrix(),E=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){a=K,n.isPresenting===!0&&De("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&De("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){return p===null&&T&&(p=new XRWebGLBinding(s,t)),p},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(C=e.getRenderTarget(),s.addEventListener("select",L),s.addEventListener("selectstart",L),s.addEventListener("selectend",L),s.addEventListener("squeeze",L),s.addEventListener("squeezestart",L),s.addEventListener("squeezeend",L),s.addEventListener("end",V),s.addEventListener("inputsourceschange",X),w.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(M),T&&"createProjectionLayer"in XRWebGLBinding.prototype){let ce=null,be=null,ge=null;w.depth&&(ge=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=w.stencil?Kn:_n,be=w.stencil?Ki:un);let Oe={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:a};p=this.getBinding(),f=p.createProjectionLayer(Oe),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new Wt(f.textureWidth,f.textureHeight,{format:an,type:qt,depthTexture:new Wn(f.textureWidth,f.textureHeight,be,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let ce={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:a};h=new XRWebGLLayer(s,t,ce),s.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),_=new Wt(h.framebufferWidth,h.framebufferHeight,{format:an,type:qt,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),we.setContext(s),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function X(K){for(let j=0;j<K.removed.length;j++){let ce=K.removed[j],be=y.indexOf(ce);be>=0&&(y[be]=null,b[be].disconnect(ce))}for(let j=0;j<K.added.length;j++){let ce=K.added[j],be=y.indexOf(ce);if(be===-1){for(let Oe=0;Oe<b.length;Oe++)if(Oe>=y.length){y.push(ce),be=Oe;break}else if(y[Oe]===null){y[Oe]=ce,be=Oe;break}if(be===-1)break}let ge=b[be];ge&&ge.connect(ce)}}let H=new k,U=new k;function J(K,j,ce){H.setFromMatrixPosition(j.matrixWorld),U.setFromMatrixPosition(ce.matrixWorld);let be=H.distanceTo(U),ge=j.projectionMatrix.elements,Oe=ce.projectionMatrix.elements,dt=ge[14]/(ge[10]-1),ze=ge[14]/(ge[10]+1),We=(ge[9]+1)/ge[5],je=(ge[9]-1)/ge[5],Ge=(ge[8]-1)/ge[0],Ze=(Oe[8]+1)/Oe[0],ht=dt*Ge,ot=dt*Ze,nt=be/(-Ge+Ze),tt=nt*-Ge;if(j.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(tt),K.translateZ(nt),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),ge[10]===-1)K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let z=dt+nt,He=ze+nt,Ve=ht-tt,P=ot+(be-tt),v=We*ze/He*z,G=je*ze/He*z;K.projectionMatrix.makePerspective(Ve,P,v,G,z,He),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function Y(K,j){j===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(j.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let j=K.near,ce=K.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(ce=m.depthFar)),O.near=I.near=R.near=j,O.far=I.far=R.far=ce,(A!==O.near||D!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),A=O.near,D=O.far),O.layers.mask=K.layers.mask|6,R.layers.mask=O.layers.mask&-5,I.layers.mask=O.layers.mask&-3;let be=K.parent,ge=O.cameras;Y(O,be);for(let Oe=0;Oe<ge.length;Oe++)Y(ge[Oe],be);ge.length===2?J(O,R,I):O.projectionMatrix.copy(R.projectionMatrix),E===null&&K.isPerspectiveCamera&&(E={camera:K,fov:K.fov,zoom:K.zoom}),ae(K,O,be)};function ae(K,j,ce){ce===null?K.matrix.copy(j.matrixWorld):(K.matrix.copy(ce.matrixWorld),K.matrix.invert(),K.matrix.multiply(j.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Va*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(f===null&&h===null))return l},this.setFoveation=function(K){l=K,f!==null&&(f.fixedFoveation=K),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(K){return d[K]};let Pe=null;function Ee(K,j){if(u=j.getViewerPose(c||r),g=j,u!==null){let ce=u.views;h!==null&&(e.setRenderTargetFramebuffer(_,h.framebuffer),e.setRenderTarget(_));let be=!1;ce.length!==O.cameras.length&&(O.cameras.length=0,be=!0);for(let ze=0;ze<ce.length;ze++){let We=ce[ze],je=null;if(h!==null)je=h.getViewport(We);else{let Ze=p.getViewSubImage(f,We);je=Ze.viewport,ze===0&&(e.setRenderTargetTextures(_,Ze.colorTexture,Ze.depthStencilTexture),e.setRenderTarget(_))}let Ge=N[ze];Ge===void 0&&(Ge=new Rt,Ge.layers.enable(ze),Ge.viewport=new xt,N[ze]=Ge),Ge.matrix.fromArray(We.transform.matrix),Ge.matrix.decompose(Ge.position,Ge.quaternion,Ge.scale),Ge.projectionMatrix.fromArray(We.projectionMatrix),Ge.projectionMatrixInverse.copy(Ge.projectionMatrix).invert(),Ge.viewport.set(je.x,je.y,je.width,je.height),ze===0&&(O.matrix.copy(Ge.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),be===!0&&O.cameras.push(Ge)}let ge=s.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&T){p=n.getBinding();let ze=p.getDepthInformation(ce[0]);ze&&ze.isValid&&ze.texture&&m.init(ze,s.renderState)}if(ge&&ge.includes("camera-access")&&T){e.state.unbindTexture(),p=n.getBinding();for(let ze=0;ze<ce.length;ze++){let We=ce[ze].camera;if(We){let je=d[We];je||(je=new ws,d[We]=je);let Ge=p.getCameraImage(We);je.sourceTexture=Ge}}}}for(let ce=0;ce<b.length;ce++){let be=y[ce],ge=b[ce];be!==null&&ge!==void 0&&ge.update(be,j,c||r)}Pe&&Pe(K,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),g=null}let we=new Ld;we.setAnimationLoop(Ee),this.setAnimationLoop=function(K){Pe=K},this.dispose=function(){}}},Pg=new gt,kd=new ke;kd.set(-1,0,0,0,1,0,0,0,1);function Lg(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,Ml(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,w,C,_){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?a(m,d):d.isMeshLambertMaterial?(a(m,d),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(a(m,d),p(m,d)):d.isMeshPhongMaterial?(a(m,d),u(m,d),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(a(m,d),f(m,d),d.isMeshPhysicalMaterial&&h(m,d,_)):d.isMeshMatcapMaterial?(a(m,d),g(m,d)):d.isMeshDepthMaterial?a(m,d):d.isMeshDistanceMaterial?(a(m,d),T(m,d)):d.isMeshNormalMaterial?a(m,d):d.isLineBasicMaterial?(r(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,w,C):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function a(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Gt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Gt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let w=e.get(d),C=w.envMap,_=w.envMapRotation;C&&(m.envMap.value=C,m.envMapRotation.value.setFromMatrix4(Pg.makeRotationFromEuler(_)).transpose(),C.isCubeTexture&&C.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(kd),m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function r(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,w,C){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*w,m.scale.value=C*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function p(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function h(m,d,w){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Gt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.retroreflectivity>0&&(m.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function T(m,d){let w=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Dg(i,e,t,n){let s={},a={},r=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,b){let y=b.program;n.uniformBlockBinding(_,y)}function c(_,b){let y=s[_.id];y===void 0&&(m(_),y=u(_),s[_.id]=y,_.addEventListener("dispose",w));let M=b.program;n.updateUBOMapping(_,M);let x=e.render.frame;a[_.id]!==x&&(f(_),a[_.id]=x)}function u(_){let b=p();_.__bindingPointIndex=b;let y=i.createBuffer(),M=_.__size,x=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,M,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,y),y}function p(){for(let _=0;_<o;_++)if(r.indexOf(_)===-1)return r.push(_),_;return Fe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let b=s[_.id],y=_.uniforms,M=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let x=0,E=y.length;x<E;x++){let R=y[x];if(Array.isArray(R))for(let I=0,N=R.length;I<N;I++)h(R[I],x,I,M);else h(R,x,0,M)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(_,b,y,M){if(T(_,b,y,M)===!0){let x=_.__offset,E=_.value;if(Array.isArray(E)){let R=0;for(let I=0;I<E.length;I++){let N=E[I],O=d(N);g(N,_.__data,R),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(R+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,_.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,_.__data)}}function g(_,b,y){typeof _=="number"||typeof _=="boolean"?b[0]=_:_.isMatrix3?(b[0]=_.elements[0],b[1]=_.elements[1],b[2]=_.elements[2],b[3]=0,b[4]=_.elements[3],b[5]=_.elements[4],b[6]=_.elements[5],b[7]=0,b[8]=_.elements[6],b[9]=_.elements[7],b[10]=_.elements[8],b[11]=0):ArrayBuffer.isView(_)?b.set(new _.constructor(_.buffer,_.byteOffset,b.length)):_.toArray(b,y)}function T(_,b,y,M){let x=_.value,E=b+"_"+y;if(M[E]===void 0)return typeof x=="number"||typeof x=="boolean"?M[E]=x:ArrayBuffer.isView(x)?M[E]=x.slice():M[E]=x.clone(),!0;{let R=M[E];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return M[E]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function m(_){let b=_.uniforms,y=0,M=16;for(let E=0,R=b.length;E<R;E++){let I=Array.isArray(b[E])?b[E]:[b[E]];for(let N=0,O=I.length;N<O;N++){let A=I[N],D=Array.isArray(A.value)?A.value:[A.value];for(let L=0,V=D.length;L<V;L++){let X=D[L],H=d(X),U=y%M,J=U%H.boundary,Y=U+J;y+=J,Y!==0&&M-Y<H.storage&&(y+=M-Y),A.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),A.__offset=y,y+=H.storage}}}let x=y%M;return x>0&&(y+=M-x),_.__size=y,_.__cache={},this}function d(_){let b={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(b.boundary=4,b.storage=4):_.isVector2?(b.boundary=8,b.storage=8):_.isVector3||_.isColor?(b.boundary=16,b.storage=12):_.isVector4?(b.boundary=16,b.storage=16):_.isMatrix3?(b.boundary=48,b.storage=48):_.isMatrix4?(b.boundary=64,b.storage=64):_.isTexture?De("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(b.boundary=16,b.storage=_.byteLength):De("WebGLRenderer: Unsupported uniform value type.",_),b}function w(_){let b=_.target;b.removeEventListener("dispose",w);let y=r.indexOf(b.__bindingPointIndex);r.splice(y,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete a[b.id]}function C(){for(let _ in s)i.deleteBuffer(s[_]);r=[],s={},a={}}return{bind:l,update:c,dispose:C}}var Ug=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Mn=null;function Fg(){return Mn===null&&(Mn=new $a(Ug,16,16,jn,pn),Mn.name="DFG_LUT",Mn.minFilter=Nt,Mn.magFilter=Nt,Mn.wrapS=vn,Mn.wrapT=vn,Mn.generateMipmaps=!1,Mn.needsUpdate=!0),Mn}var lo=class{constructor(e={}){let{canvas:t=ed(),context:n=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:f=!1,outputBufferType:h=qt}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=r;let T=h,m=new Set([wr,Mr,Sr]),d=new Set([qt,un,Ji,Ki,yr,br]),w=new Uint32Array(4),C=new Int32Array(4),_=new k,b=null,y=null,M=[],x=[],E=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=hn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,N=null,O=null,A=null,D=null;this._outputColorSpace=zt;let L=0,V=0,X=null,H=-1,U=null,J=new xt,Y=new xt,ae=null,Pe=new Ye(0),Ee=0,we=t.width,K=t.height,j=1,ce=null,be=null,ge=new xt(0,0,we,K),Oe=new xt(0,0,we,K),dt=!1,ze=new Oi,We=!1,je=!1,Ge=new gt,Ze=new k,ht=new xt,ot={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},nt=!1;function tt(){return X===null?j:1}let z=n;function He(S,F){return t.getContext(S,F)}let Ve,P,v,G,W,ee,le,de,Q,ne,me,Se,he,ue,Ae,Ie,Ue,B,fe,te,pe,oe,se;try{let S={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Le,!1),t.addEventListener("webglcontextrestored",Be,!1),t.addEventListener("webglcontextcreationerror",it,!1),z===null){let F="webgl2";if(z=He(F,S),z===null)throw He(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ie()}catch(S){throw t.removeEventListener("webglcontextlost",Le,!1),t.removeEventListener("webglcontextrestored",Be,!1),t.removeEventListener("webglcontextcreationerror",it,!1),Fe("WebGLRenderer: "+S.message),S}function ie(){Ve=new Hp(z),Ve.init(),pe=new Rg(z,Ve),P=new Lp(z,Ve,e,pe),v=new Ag(z,Ve),P.reversedDepthBuffer&&f&&v.buffers.depth.setReversed(!0),O=z.createFramebuffer(),A=z.createFramebuffer(),D=z.createFramebuffer(),G=new qp(z),W=new fg,ee=new Cg(z,Ve,v,W,P,pe,G),le=new Vp(R),de=new $h(z),oe=new Ip(z,de),Q=new Wp(z,de,G,oe),ne=new Yp(z,Q,de,oe,G),B=new $p(z,P,ee),Ae=new Dp(W),me=new ug(R,le,Ve,P,oe,Ae),Se=new Lg(R,W),he=new mg,ue=new bg(Ve),Ue=new Np(R,le,v,ne,g,l),Ie=new Eg(R,ne,P),se=new Dg(z,G,P,v),fe=new Pp(z,Ve,G),te=new Xp(z,Ve,G),G.programs=me.programs,R.capabilities=P,R.extensions=Ve,R.properties=W,R.renderLists=he,R.shadowMap=Ie,R.state=v,R.info=G}T!==qt&&(E=new Jp(T,t.width,t.height,o,s,a));let re=new ql(R,z);this.xr=re,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let S=Ve.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=Ve.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(S){S!==void 0&&(j=S,this.setSize(we,K,!1))},this.getSize=function(S){return S.set(we,K)},this.setSize=function(S,F,Z=!0){if(re.isPresenting){De("WebGLRenderer: Can't change size while VR device is presenting.");return}we=S,K=F,t.width=Math.floor(S*j),t.height=Math.floor(F*j),Z===!0&&(t.style.width=S+"px",t.style.height=F+"px"),E!==null&&E.setSize(t.width,t.height),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(we*j,K*j).floor()},this.setDrawingBufferSize=function(S,F,Z){we=S,K=F,j=Z,t.width=Math.floor(S*Z),t.height=Math.floor(F*Z),this.setViewport(0,0,S,F)},this.setEffects=function(S){if(T===qt){Fe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let F=0;F<S.length;F++)if(S[F].isOutputPass===!0){De("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(J)},this.getViewport=function(S){return S.copy(ge)},this.setViewport=function(S,F,Z,q){S.isVector4?ge.set(S.x,S.y,S.z,S.w):ge.set(S,F,Z,q),v.viewport(J.copy(ge).multiplyScalar(j).round())},this.getScissor=function(S){return S.copy(Oe)},this.setScissor=function(S,F,Z,q){S.isVector4?Oe.set(S.x,S.y,S.z,S.w):Oe.set(S,F,Z,q),v.scissor(Y.copy(Oe).multiplyScalar(j).round())},this.getScissorTest=function(){return dt},this.setScissorTest=function(S){v.setScissorTest(dt=S)},this.setOpaqueSort=function(S){ce=S},this.setTransparentSort=function(S){be=S},this.getClearColor=function(S){return S.copy(Ue.getClearColor())},this.setClearColor=function(){Ue.setClearColor(...arguments)},this.getClearAlpha=function(){return Ue.getClearAlpha()},this.setClearAlpha=function(){Ue.setClearAlpha(...arguments)},this.clear=function(S=!0,F=!0,Z=!0){let q=0;if(S){let $=!1;if(X!==null){let ye=X.texture.format;$=m.has(ye)}if($){let ye=X.texture.type,Te=d.has(ye),_e=Ue.getClearColor(),Ce=Ue.getClearAlpha(),Ne=_e.r,Xe=_e.g,Je=_e.b;Te?(w[0]=Ne,w[1]=Xe,w[2]=Je,w[3]=Ce,z.clearBufferuiv(z.COLOR,0,w)):(C[0]=Ne,C[1]=Xe,C[2]=Je,C[3]=Ce,z.clearBufferiv(z.COLOR,0,C))}else q|=z.COLOR_BUFFER_BIT}F&&(q|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(q|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),q!==0&&z.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),N=S},this.dispose=function(){t.removeEventListener("webglcontextlost",Le,!1),t.removeEventListener("webglcontextrestored",Be,!1),t.removeEventListener("webglcontextcreationerror",it,!1),Ue.dispose(),he.dispose(),ue.dispose(),W.dispose(),le.dispose(),ne.dispose(),oe.dispose(),se.dispose(),me.dispose(),re.dispose(),re.removeEventListener("sessionstart",Qn),re.removeEventListener("sessionend",Yt),_t.stop()};function Le(S){S.preventDefault(),bl("WebGLRenderer: Context Lost."),I=!0}function Be(){bl("WebGLRenderer: Context Restored."),I=!1;let S=G.autoReset,F=Ie.enabled,Z=Ie.autoUpdate,q=Ie.needsUpdate,$=Ie.type;ie(),G.autoReset=S,Ie.enabled=F,Ie.autoUpdate=Z,Ie.needsUpdate=q,Ie.type=$}function it(S){Fe("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function mt(S){let F=S.target;F.removeEventListener("dispose",mt),Qe(F)}function Qe(S){mn(S),W.remove(S)}function mn(S){let F=W.get(S).programs;F!==void 0&&(F.forEach(function(Z){me.releaseProgram(Z)}),S.isShaderMaterial&&me.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,Z,q,$,ye){F===null&&(F=ot);let Te=$.isMesh&&$.matrixWorld.determinantAffine()<0,_e=oa(S,F,Z,q,$);v.setMaterial(q,Te);let Ce=Z.index,Ne=1;if(q.wireframe===!0){if(Ce=Q.getWireframeAttribute(Z),Ce===void 0)return;Ne=2}let Xe=Z.drawRange,Je=Z.attributes.position,Re=Xe.start*Ne,st=(Xe.start+Xe.count)*Ne;ye!==null&&(Re=Math.max(Re,ye.start*Ne),st=Math.min(st,(ye.start+ye.count)*Ne)),Ce!==null?(Re=Math.max(Re,0),st=Math.min(st,Ce.count)):Je!=null&&(Re=Math.max(Re,0),st=Math.min(st,Je.count));let St=st-Re;if(St<0||St===1/0)return;oe.setup($,q,_e,Z,Ce);let ft,ct=fe;if(Ce!==null&&(ft=de.get(Ce),ct=te,ct.setIndex(ft)),$.isMesh)q.wireframe===!0?(v.setLineWidth(q.wireframeLinewidth*tt()),ct.setMode(z.LINES)):ct.setMode(z.TRIANGLES);else if($.isLine){let Pt=q.linewidth;Pt===void 0&&(Pt=1),v.setLineWidth(Pt*tt()),$.isLineSegments?ct.setMode(z.LINES):$.isLineLoop?ct.setMode(z.LINE_LOOP):ct.setMode(z.LINE_STRIP)}else $.isPoints?ct.setMode(z.POINTS):$.isSprite&&ct.setMode(z.TRIANGLES);if($.isBatchedMesh)if(Ve.get("WEBGL_multi_draw"))ct.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{let Pt=$._multiDrawStarts,Me=$._multiDrawCounts,kt=$._multiDrawCount,et=Ce?de.get(Ce).bytesPerElement:1,en=W.get(q).currentProgram.getUniforms();for(let gn=0;gn<kt;gn++)en.setValue(z,"_gl_DrawID",gn),ct.render(Pt[gn]/et,Me[gn])}else if($.isInstancedMesh)ct.renderInstances(Re,St,$.count);else if(Z.isInstancedBufferGeometry){let Pt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Me=Math.min(Z.instanceCount,Pt);ct.renderInstances(Re,St,Me)}else ct.render(Re,St)};function It(S,F,Z,q){N!==null&&S.isNodeMaterial&&N.setObject(q,S),We===!0&&Ae.setState(S,Z,!1),S.transparent===!0&&S.side===Ot&&S.forceSinglePass===!1?(S.side=Gt,S.needsUpdate=!0,fi(S,F,q),S.side=Yn,S.needsUpdate=!0,fi(S,F,q),S.side=Ot):fi(S,F,q)}this.compile=function(S,F,Z=null){Z===null&&(Z=S),N!==null&&N.renderStart(S,F,Z),y=ue.get(Z),y.init(F),x.push(y),Z.traverseVisible(function($){$.isLight&&$.layers.test(F.layers)&&(y.pushLight($),$.castShadow&&y.pushShadow($))}),S!==Z&&S.traverseVisible(function($){$.isLight&&$.layers.test(F.layers)&&(y.pushLight($),$.castShadow&&y.pushShadow($))}),y.setupLights(),N!==null&&N.updateLights(y.state.lightsArray),je=this.localClippingEnabled,We=Ae.init(this.clippingPlanes,je),We===!0&&Ae.setGlobalState(this.clippingPlanes,F),N!==null&&Ie.render(y.state.shadowsArray,Z,F);let q=new Set;return S.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;let ye=$.material;if(ye)if(Array.isArray(ye))for(let Te=0;Te<ye.length;Te++){let _e=ye[Te];It(_e,Z,F,$),q.add(_e)}else It(ye,Z,F,$),q.add(ye)}),y=x.pop(),N!==null&&N.renderEnd(),q},this.compileAsync=function(S,F,Z=null){let q=this.compile(S,F,Z);return new Promise($=>{function ye(){if(q.forEach(function(Te){let Ce=W.get(Te).currentProgram;(Ce===void 0||Ce.isReady())&&q.delete(Te)}),q.size===0){$(S);return}setTimeout(ye,10)}Ve.get("KHR_parallel_shader_compile")!==null?ye():setTimeout(ye,10)})};let bt=null;function $t(S){bt&&bt(S)}function Qn(){_t.stop()}function Yt(){_t.start()}let _t=new Ld;_t.setAnimationLoop($t),typeof self<"u"&&_t.setContext(self),this.setAnimationLoop=function(S){bt=S,re.setAnimationLoop(S),S===null?_t.stop():_t.start()},re.addEventListener("sessionstart",Qn),re.addEventListener("sessionend",Yt),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){Fe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;N!==null&&N.renderStart(S,F);let Z=re.enabled===!0&&re.isPresenting===!0,q=E!==null&&(X===null||Z)&&E.begin(R,X);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(re.cameraAutoUpdate===!0&&re.updateCamera(F),F=re.getCamera()),S.isScene===!0&&S.onBeforeRender(R,S,F,X),y=ue.get(S,x.length),y.init(F),y.state.textureUnits=ee.getTextureUnits(),x.push(y),Ge.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),ze.setFromProjectionMatrix(Ge,dn,F.reversedDepth),je=this.localClippingEnabled,We=Ae.init(this.clippingPlanes,je),b=he.get(S,M.length),b.init(),M.push(b),re.enabled===!0&&re.isPresenting===!0){let Te=R.xr.getDepthSensingMesh();Te!==null&&Et(Te,F,-1/0,R.sortObjects)}Et(S,F,0,R.sortObjects),b.finish(),N!==null&&N.updateLights(y.state.lightsArray),R.sortObjects===!0&&b.sort(ce,be),nt=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,nt&&Ue.addToRenderList(b,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),We===!0&&Ae.beginShadows();let $=y.state.shadowsArray;if(Ie.render($,S,F),We===!0&&Ae.endShadows(),(q&&E.hasRenderPass())===!1){let Te=b.opaque,_e=b.transmissive;if(y.setupLights(),F.isArrayCamera){let Ce=F.cameras;if(_e.length>0)for(let Ne=0,Xe=Ce.length;Ne<Xe;Ne++){let Je=Ce[Ne];is(Te,_e,S,Je)}nt&&Ue.render(S);for(let Ne=0,Xe=Ce.length;Ne<Xe;Ne++){let Je=Ce[Ne];ei(b,S,Je,Je.viewport)}}else _e.length>0&&is(Te,_e,S,F),nt&&Ue.render(S),ei(b,S,F)}X!==null&&V===0&&(ee.updateMultisampleRenderTarget(X),ee.updateRenderTargetMipmap(X)),q&&E.end(R),S.isScene===!0&&S.onAfterRender(R,S,F),oe.resetDefaultState(),H=-1,U=null,x.pop(),x.length>0?(y=x[x.length-1],ee.setTextureUnits(y.state.textureUnits),We===!0&&Ae.setGlobalState(R.clippingPlanes,y.state.camera)):y=null,M.pop(),M.length>0?b=M[M.length-1]:b=null,N!==null&&N.renderEnd()};function Et(S,F,Z,q){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)Z=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLightProbeGrid)y.pushLightProbeGrid(S);else if(S.isLight)y.pushLight(S),S.castShadow&&y.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(ze)){q&&ht.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Ge);let Te=ne.update(S),_e=S.material;_e.visible&&b.push(S,Te,_e,Z,ht.z,null,F)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(ze))){let Te=ne.update(S),_e=S.material;if(q&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),ht.copy(S.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),ht.copy(Te.boundingSphere.center)),ht.applyMatrix4(S.matrixWorld).applyMatrix4(Ge)),Array.isArray(_e)){let Ce=Te.groups;for(let Ne=0,Xe=Ce.length;Ne<Xe;Ne++){let Je=Ce[Ne],Re=_e[Je.materialIndex];Re&&Re.visible&&b.push(S,Te,Re,Z,ht.z,Je,F)}}else _e.visible&&b.push(S,Te,_e,Z,ht.z,null,F)}}let ye=S.children;for(let Te=0,_e=ye.length;Te<_e;Te++)Et(ye[Te],F,Z,q)}function ei(S,F,Z,q){let{opaque:$,transmissive:ye,transparent:Te}=S;y.setupLightsView(Z),We===!0&&Ae.setGlobalState(R.clippingPlanes,Z),q&&v.viewport(J.copy(q)),$.length>0&&ui($,F,Z),ye.length>0&&ui(ye,F,Z),Te.length>0&&ui(Te,F,Z),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function is(S,F,Z,q){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[q.id]===void 0){let Re=Ve.has("EXT_color_buffer_half_float")||Ve.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[q.id]=new Wt(1,1,{generateMipmaps:!0,type:Re?pn:qt,minFilter:Jn,samples:Math.max(4,P.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ke.workingColorSpace})}let ye=y.state.transmissionRenderTarget[q.id],Te=q.viewport||J;ye.setSize(Te.z*R.transmissionResolutionScale,Te.w*R.transmissionResolutionScale);let _e=R.getRenderTarget(),Ce=R.getActiveCubeFace(),Ne=R.getActiveMipmapLevel();R.setRenderTarget(ye),R.getClearColor(Pe),Ee=R.getClearAlpha(),Ee<1&&R.setClearColor(16777215,.5),R.clear(),nt&&Ue.render(Z);let Xe=R.toneMapping;R.toneMapping=hn;let Je=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),y.setupLightsView(q),We===!0&&Ae.setGlobalState(R.clippingPlanes,q),ui(S,Z,q),ee.updateMultisampleRenderTarget(ye),ee.updateRenderTargetMipmap(ye),Ve.has("WEBGL_multisampled_render_to_texture")===!1){let Re=!1;for(let st=0,St=F.length;st<St;st++){let ft=F[st],{object:ct,geometry:Pt,material:Me,group:kt}=ft;if(Me.side===Ot&&ct.layers.test(q.layers)){let et=Me.side;Me.side=Gt,Me.needsUpdate=!0,sa(ct,Z,q,Pt,Me,kt),Me.side=et,Me.needsUpdate=!0,Re=!0}}Re===!0&&(ee.updateMultisampleRenderTarget(ye),ee.updateRenderTargetMipmap(ye))}R.setRenderTarget(_e,Ce,Ne),R.setClearColor(Pe,Ee),Je!==void 0&&(q.viewport=Je),R.toneMapping=Xe}function ui(S,F,Z){let q=F.isScene===!0?F.overrideMaterial:null;for(let $=0,ye=S.length;$<ye;$++){let Te=S[$],{object:_e,geometry:Ce,group:Ne}=Te,Xe=Te.material;Xe.allowOverride===!0&&q!==null&&(Xe=q),_e.layers.test(Z.layers)&&sa(_e,F,Z,Ce,Xe,Ne)}}function sa(S,F,Z,q,$,ye){N!==null&&$.isNodeMaterial&&N.setObject(S,$),S.onBeforeRender(R,F,Z,q,$,ye),S.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),$.onBeforeRender(R,F,Z,q,S,ye),$.transparent===!0&&$.side===Ot&&$.forceSinglePass===!1?($.side=Gt,$.needsUpdate=!0,R.renderBufferDirect(Z,F,q,$,S,ye),$.side=Yn,$.needsUpdate=!0,R.renderBufferDirect(Z,F,q,$,S,ye),$.side=Ot):R.renderBufferDirect(Z,F,q,$,S,ye),S.onAfterRender(R,F,Z,q,$,ye)}function fi(S,F,Z){F.isScene!==!0&&(F=ot);let q=W.get(S),$=y.state.lights,ye=y.state.shadowsArray,Te=$.state.version,_e=me.getParameters(S,$.state,ye,F,Z,y.state.lightProbeGridArray),Ce=me.getProgramCacheKey(_e),Ne=q.programs;q.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?F.environment:null,q.fog=F.fog;let Xe=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;q.envMap=le.get(S.envMap||q.environment,Xe),q.envMapRotation=q.environment!==null&&S.envMap===null?F.environmentRotation:S.envMapRotation,Ne===void 0&&(S.addEventListener("dispose",mt),Ne=new Map,q.programs=Ne);let Je=Ne.get(Ce);if(Je!==void 0){if(q.currentProgram===Je&&q.lightsStateVersion===Te)return ra(S,_e),Je}else _e.uniforms=me.getUniforms(S),N!==null&&S.isNodeMaterial&&N.build(S,Z,_e),S.onBeforeCompile(_e,R),Je=me.acquireProgram(_e,Ce),Ne.set(Ce,Je),q.uniforms=_e.uniforms;let Re=q.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Re.clippingPlanes=Ae.uniform),ra(S,_e),q.needsLights=po(S),q.lightsStateVersion=Te,q.needsLights&&(Re.ambientLightColor.value=$.state.ambient,Re.lightProbe.value=$.state.probe,Re.sunLights.value=$.state.sun,Re.sunLightShadows.value=$.state.sunShadow,Re.directionalLights.value=$.state.directional,Re.directionalLightShadows.value=$.state.directionalShadow,Re.spotLights.value=$.state.spot,Re.spotLightShadows.value=$.state.spotShadow,Re.rectAreaLights.value=$.state.rectArea,Re.ltc_1.value=$.state.rectAreaLTC1,Re.ltc_2.value=$.state.rectAreaLTC2,Re.pointLights.value=$.state.point,Re.pointLightShadows.value=$.state.pointShadow,Re.hemisphereLights.value=$.state.hemi,Re.sunShadowMatrix.value=$.state.sunShadowMatrix,Re.sunShadowCascade.value=$.state.sunShadowCascade,Re.directionalShadowMatrix.value=$.state.directionalShadowMatrix,Re.spotLightMatrix.value=$.state.spotLightMatrix,Re.spotLightMap.value=$.state.spotLightMap,Re.pointShadowMatrix.value=$.state.pointShadowMatrix),q.lightProbeGrid=y.state.lightProbeGridArray.length>0,q.currentProgram=Je,q.uniformsList=null,Je}function aa(S){if(S.uniformsList===null){let F=S.currentProgram.getUniforms();S.uniformsList=ts.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function ra(S,F){let Z=W.get(S);Z.outputColorSpace=F.outputColorSpace,Z.batching=F.batching,Z.batchingColor=F.batchingColor,Z.instancing=F.instancing,Z.instancingColor=F.instancingColor,Z.instancingMorph=F.instancingMorph,Z.skinning=F.skinning,Z.morphTargets=F.morphTargets,Z.morphNormals=F.morphNormals,Z.morphColors=F.morphColors,Z.morphTargetsCount=F.morphTargetsCount,Z.numClippingPlanes=F.numClippingPlanes,Z.numIntersection=F.numClipIntersection,Z.vertexAlphas=F.vertexAlphas,Z.vertexTangents=F.vertexTangents,Z.toneMapping=F.toneMapping}function uo(S,F){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;_.setFromMatrixPosition(F.matrixWorld);for(let Z=0,q=S.length;Z<q;Z++){let $=S[Z];if($.texture!==null&&$.boundingBox.containsPoint(_))return $}return null}function oa(S,F,Z,q,$){F.isScene!==!0&&(F=ot),ee.resetTextureUnits();let ye=F.fog,Te=q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial?F.environment:null,_e=X===null?R.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:Ke.workingColorSpace,Ce=q.isMeshStandardMaterial||q.isMeshLambertMaterial&&!q.envMap||q.isMeshPhongMaterial&&!q.envMap,Ne=le.get(q.envMap||Te,Ce),Xe=q.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,Je=!!Z.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Re=!!Z.morphAttributes.position,st=!!Z.morphAttributes.normal,St=!!Z.morphAttributes.color,ft=hn;q.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(ft=R.toneMapping);let ct=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Pt=ct!==void 0?ct.length:0,Me=W.get(q),kt=y.state.lights;if(We===!0&&(je===!0||S!==U)){let ut=S===U&&q.id===H;Ae.setState(q,S,ut)}let et=!1;q.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==kt.state.version||Me.outputColorSpace!==_e||$.isBatchedMesh&&Me.batching===!1||!$.isBatchedMesh&&Me.batching===!0||$.isBatchedMesh&&Me.batchingColor===!0&&$._colorsTexture===null||$.isBatchedMesh&&Me.batchingColor===!1&&$._colorsTexture!==null||$.isInstancedMesh&&Me.instancing===!1||!$.isInstancedMesh&&Me.instancing===!0||$.isSkinnedMesh&&Me.skinning===!1||!$.isSkinnedMesh&&Me.skinning===!0||$.isInstancedMesh&&Me.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&Me.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&Me.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&Me.instancingMorph===!1&&$.morphTexture!==null||Me.envMap!==Ne||q.fog===!0&&Me.fog!==ye||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==Ae.numPlanes||Me.numIntersection!==Ae.numIntersection)||Me.vertexAlphas!==Xe||Me.vertexTangents!==Je||Me.morphTargets!==Re||Me.morphNormals!==st||Me.morphColors!==St||Me.toneMapping!==ft||Me.morphTargetsCount!==Pt||!!Me.lightProbeGrid!=y.state.lightProbeGridArray.length>0)&&(et=!0):(et=!0,Me.__version=q.version);let en=Me.currentProgram;et===!0&&(en=fi(q,F,$),N&&q.isNodeMaterial&&N.onUpdateProgram(q,en,Me));let gn=!1,Ln=!1,pi=!1,lt=en.getUniforms(),yt=Me.uniforms;if(v.useProgram(en.program)&&(gn=!0,Ln=!0,pi=!0),q.id!==H&&(H=q.id,Ln=!0),Me.needsLights){let ut=uo(y.state.lightProbeGridArray,$);Me.lightProbeGrid!==ut&&(Me.lightProbeGrid=ut,Ln=!0)}if(gn||U!==S){v.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),lt.setValue(z,"projectionMatrix",S.projectionMatrix),lt.setValue(z,"viewMatrix",S.matrixWorldInverse);let Un=lt.map.cameraPosition;Un!==void 0&&Un.setValue(z,Ze.setFromMatrixPosition(S.matrixWorld)),P.logarithmicDepthBuffer&&lt.setValue(z,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&lt.setValue(z,"isOrthographic",S.isOrthographicCamera===!0),U!==S&&(U=S,Ln=!0,pi=!0)}if(Me.needsLights&&(kt.state.sunShadowMap.length>0&&lt.setValue(z,"sunShadowMap",kt.state.sunShadowMap,ee),kt.state.directionalShadowMap.length>0&&lt.setValue(z,"directionalShadowMap",kt.state.directionalShadowMap,ee),kt.state.spotShadowMap.length>0&&lt.setValue(z,"spotShadowMap",kt.state.spotShadowMap,ee),kt.state.pointShadowMap.length>0&&lt.setValue(z,"pointShadowMap",kt.state.pointShadowMap,ee)),$.isSkinnedMesh){lt.setOptional(z,$,"bindMatrix"),lt.setOptional(z,$,"bindMatrixInverse");let ut=$.skeleton;ut&&(ut.boneTexture===null&&ut.computeBoneTexture(),lt.setValue(z,"boneTexture",ut.boneTexture,ee))}$.isBatchedMesh&&(lt.setOptional(z,$,"batchingTexture"),lt.setValue(z,"batchingTexture",$._matricesTexture,ee),lt.setOptional(z,$,"batchingIdTexture"),lt.setValue(z,"batchingIdTexture",$._indirectTexture,ee),lt.setOptional(z,$,"batchingColorTexture"),$._colorsTexture!==null&&lt.setValue(z,"batchingColorTexture",$._colorsTexture,ee));let Dn=Z.morphAttributes;if((Dn.position!==void 0||Dn.normal!==void 0||Dn.color!==void 0)&&B.update($,Z,en),(Ln||Me.receiveShadow!==$.receiveShadow)&&(Me.receiveShadow=$.receiveShadow,lt.setValue(z,"receiveShadow",$.receiveShadow)),(q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial)&&q.envMap===null&&F.environment!==null&&(yt.envMapIntensity.value=F.environmentIntensity),yt.dfgLUT!==void 0&&(yt.dfgLUT.value=Fg()),Ln){if(lt.setValue(z,"toneMappingExposure",R.toneMappingExposure),Me.needsLights&&fo(yt,pi),ye&&q.fog===!0&&Se.refreshFogUniforms(yt,ye),Se.refreshMaterialUniforms(yt,q,j,K,y.state.transmissionRenderTarget[S.id]),Me.needsLights&&Me.lightProbeGrid){let ut=Me.lightProbeGrid;yt.probesSH.value=ut.texture,yt.probesMin.value.copy(ut.boundingBox.min),yt.probesMax.value.copy(ut.boundingBox.max),yt.probesResolution.value.copy(ut.resolution)}ts.upload(z,aa(Me),yt,ee)}if(q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(ts.upload(z,aa(Me),yt,ee),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&lt.setValue(z,"center",$.center),lt.setValue(z,"modelViewMatrix",$.modelViewMatrix),lt.setValue(z,"normalMatrix",$.normalMatrix),lt.setValue(z,"modelMatrix",$.matrixWorld),q.uniformsGroups!==void 0){let ut=q.uniformsGroups;for(let Un=0,mi=ut.length;Un<mi;Un++){let $l=ut[Un];se.update($l,en),se.bind($l,en)}}return en}function fo(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.sunLights.needsUpdate=F,S.sunLightShadows.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function po(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(S,F,Z){let q=W.get(S);q.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),W.get(S.texture).__webglTexture=F,W.get(S.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:Z,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,F){let Z=W.get(S);Z.__webglFramebuffer=F,Z.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,Z=0){X=S,L=F,V=Z;let q=null,$=!1,ye=!1;if(S){let _e=W.get(S);if(_e.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(z.FRAMEBUFFER,_e.__webglFramebuffer),J.copy(S.viewport),Y.copy(S.scissor),ae=S.scissorTest,v.viewport(J),v.scissor(Y),v.setScissorTest(ae),H=-1;return}else if(_e.__webglFramebuffer===void 0)ee.setupRenderTarget(S);else if(_e.__hasExternalTextures)ee.rebindTextures(S,W.get(S.texture).__webglTexture,W.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let Xe=S.depthTexture;if(_e.__boundDepthTexture!==Xe){if(Xe!==null&&W.has(Xe)&&(S.width!==Xe.image.width||S.height!==Xe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ee.setupDepthRenderbuffer(S)}}let Ce=S.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(ye=!0);let Ne=W.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ne[F])?q=Ne[F][Z]:q=Ne[F],$=!0):S.samples>0&&ee.useMultisampledRTT(S)===!1?q=W.get(S).__webglMultisampledFramebuffer:Array.isArray(Ne)?q=Ne[Z]:q=Ne,J.copy(S.viewport),Y.copy(S.scissor),ae=S.scissorTest}else J.copy(ge).multiplyScalar(j).floor(),Y.copy(Oe).multiplyScalar(j).floor(),ae=dt;if(Z!==0&&(q=O),v.bindFramebuffer(z.FRAMEBUFFER,q)&&v.drawBuffers(S,q),v.viewport(J),v.scissor(Y),v.setScissorTest(ae),$){let _e=W.get(S.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+F,_e.__webglTexture,Z)}else if(ye){let _e=F;for(let Ce=0;Ce<S.textures.length;Ce++){let Ne=W.get(S.textures[Ce]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+Ce,Ne.__webglTexture,Z,_e)}}else if(S!==null&&Z!==0){let _e=W.get(S.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,_e.__webglTexture,Z)}H=-1};function la(S){let F=W.get(S);return(F.__readFormat!==S.format||F.__readType!==S.type)&&(F.__readFormat=S.format,F.__readType=S.type,F.__formatReadable=P.textureFormatReadable(S.format),F.__typeReadable=P.textureTypeReadable(S.type)),F}this.readRenderTargetPixels=function(S,F,Z,q,$,ye,Te,_e=0){if(!(S&&S.isWebGLRenderTarget)){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce){v.bindFramebuffer(z.FRAMEBUFFER,Ce);try{let Ne=S.textures[_e],Xe=Ne.format,Je=Ne.type;S.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+_e);let Re=la(Ne);if(Re.__formatReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Re.__typeReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-q&&Z>=0&&Z<=S.height-$&&z.readPixels(F,Z,q,$,pe.convert(Xe),pe.convert(Je),ye)}finally{let Ne=X!==null?W.get(X).__webglFramebuffer:null;v.bindFramebuffer(z.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(S,F,Z,q,$,ye,Te,_e=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce)if(F>=0&&F<=S.width-q&&Z>=0&&Z<=S.height-$){v.bindFramebuffer(z.FRAMEBUFFER,Ce);let Ne=S.textures[_e],Xe=Ne.format,Je=Ne.type;S.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+_e);let Re=la(Ne);if(Re.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Re.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let st=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,st),z.bufferData(z.PIXEL_PACK_BUFFER,ye.byteLength,z.STREAM_READ),z.readPixels(F,Z,q,$,pe.convert(Xe),pe.convert(Je),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);let St=X!==null?W.get(X).__webglFramebuffer:null;v.bindFramebuffer(z.FRAMEBUFFER,St);let ft=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await nd(z,ft,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,st),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,ye),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(st),z.deleteSync(ft),ye}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,F=null,Z=0){let q=Math.pow(2,-Z),$=Math.floor(S.image.width*q),ye=Math.floor(S.image.height*q),Te=F!==null?F.x:0,_e=F!==null?F.y:0;ee.setTexture2D(S,0),z.copyTexSubImage2D(z.TEXTURE_2D,Z,0,0,Te,_e,$,ye),v.unbindTexture()},this.copyTextureToTexture=function(S,F,Z=null,q=null,$=0,ye=0){let Te,_e,Ce,Ne,Xe,Je,Re,st,St,ft=S.isCompressedTexture?S.mipmaps[ye]:S.image;if(Z!==null)Te=Z.max.x-Z.min.x,_e=Z.max.y-Z.min.y,Ce=Z.isBox3?Z.max.z-Z.min.z:1,Ne=Z.min.x,Xe=Z.min.y,Je=Z.isBox3?Z.min.z:0;else{let yt=Math.pow(2,-$);Te=Math.floor(ft.width*yt),_e=Math.floor(ft.height*yt),S.isDataArrayTexture?Ce=ft.depth:S.isData3DTexture?Ce=Math.floor(ft.depth*yt):Ce=1,Ne=0,Xe=0,Je=0}q!==null?(Re=q.x,st=q.y,St=q.z):(Re=0,st=0,St=0);let ct=pe.convert(F.format),Pt=pe.convert(F.type),Me;F.isData3DTexture?(ee.setTexture3D(F,0),Me=z.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(ee.setTexture2DArray(F,0),Me=z.TEXTURE_2D_ARRAY):(ee.setTexture2D(F,0),Me=z.TEXTURE_2D),v.activeTexture(z.TEXTURE0),v.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,F.flipY),v.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),v.pixelStorei(z.UNPACK_ALIGNMENT,F.unpackAlignment);let kt=v.getParameter(z.UNPACK_ROW_LENGTH),et=v.getParameter(z.UNPACK_IMAGE_HEIGHT),en=v.getParameter(z.UNPACK_SKIP_PIXELS),gn=v.getParameter(z.UNPACK_SKIP_ROWS),Ln=v.getParameter(z.UNPACK_SKIP_IMAGES);v.pixelStorei(z.UNPACK_ROW_LENGTH,ft.width),v.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ft.height),v.pixelStorei(z.UNPACK_SKIP_PIXELS,Ne),v.pixelStorei(z.UNPACK_SKIP_ROWS,Xe),v.pixelStorei(z.UNPACK_SKIP_IMAGES,Je);let pi=S.isDataArrayTexture||S.isData3DTexture,lt=F.isDataArrayTexture||F.isData3DTexture;if(S.isDepthTexture){let yt=W.get(S),Dn=W.get(F),ut=W.get(yt.__renderTarget),Un=W.get(Dn.__renderTarget);v.bindFramebuffer(z.READ_FRAMEBUFFER,ut.__webglFramebuffer),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,Un.__webglFramebuffer);for(let mi=0;mi<Ce;mi++)pi&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,W.get(S).__webglTexture,$,Je+mi),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,W.get(F).__webglTexture,ye,St+mi)),z.blitFramebuffer(Ne,Xe,Te,_e,Re,st,Te,_e,z.DEPTH_BUFFER_BIT,z.NEAREST);v.bindFramebuffer(z.READ_FRAMEBUFFER,null),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if($!==0||S.isRenderTargetTexture||W.has(S)){let yt=W.get(S),Dn=W.get(F);v.bindFramebuffer(z.READ_FRAMEBUFFER,A),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,D);for(let ut=0;ut<Ce;ut++)pi?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,yt.__webglTexture,$,Je+ut):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,yt.__webglTexture,$),lt?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Dn.__webglTexture,ye,St+ut):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,Dn.__webglTexture,ye),$!==0?z.blitFramebuffer(Ne,Xe,Te,_e,Re,st,Te,_e,z.COLOR_BUFFER_BIT,z.NEAREST):lt?z.copyTexSubImage3D(Me,ye,Re,st,St+ut,Ne,Xe,Te,_e):z.copyTexSubImage2D(Me,ye,Re,st,Ne,Xe,Te,_e);v.bindFramebuffer(z.READ_FRAMEBUFFER,null),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else lt?S.isDataTexture||S.isData3DTexture?z.texSubImage3D(Me,ye,Re,st,St,Te,_e,Ce,ct,Pt,ft.data):F.isCompressedArrayTexture?z.compressedTexSubImage3D(Me,ye,Re,st,St,Te,_e,Ce,ct,ft.data):z.texSubImage3D(Me,ye,Re,st,St,Te,_e,Ce,ct,Pt,ft):S.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,ye,Re,st,Te,_e,ct,Pt,ft.data):S.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,ye,Re,st,ft.width,ft.height,ct,ft.data):z.texSubImage2D(z.TEXTURE_2D,ye,Re,st,Te,_e,ct,Pt,ft);v.pixelStorei(z.UNPACK_ROW_LENGTH,kt),v.pixelStorei(z.UNPACK_IMAGE_HEIGHT,et),v.pixelStorei(z.UNPACK_SKIP_PIXELS,en),v.pixelStorei(z.UNPACK_SKIP_ROWS,gn),v.pixelStorei(z.UNPACK_SKIP_IMAGES,Ln),ye===0&&F.generateMipmaps&&z.generateMipmap(Me),v.unbindTexture()},this.initRenderTarget=function(S){W.get(S).__webglFramebuffer===void 0&&ee.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?ee.setTextureCube(S,0):S.isData3DTexture?ee.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?ee.setTexture2DArray(S,0):ee.setTexture2D(S,0),v.unbindTexture()},this.resetState=function(){L=0,V=0,X=null,v.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return dn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ke._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ke._getUnpackColorSpace()}};(function(){let{useState:i,useEffect:e,useRef:t}=React,{Card:n,SectionTitle:s,Badge:a,Icon:r,Segmented:o,Spinner:l,Empty:c,ProgressRing:u,Modal:p}=window.CG.UI,{ProbBars:f,BarChart:h}=window.CG.Charts;function g(){let{t:y,lang:M,toast:x,user:E}=window.CG.Store.useStore(),[R,I]=i("plant"),[N,O]=i(null),[A,D]=i(null),[L,V]=i(null),[X,H]=i(null),[U,J]=i(!1),[Y,ae]=i(null),[Pe,Ee]=i(null),[we,K]=i("file_selected"),[j,ce]=i([]),[be,ge]=i(""),[Oe,dt]=i(!1),[ze,We]=i(!1),[je,Ge]=i(!1),Ze=t(null),ht=t(null),ot=t(null);e(()=>{window.CG.API_CLIENT.fields().then(ce).catch(()=>{})},[]);let nt=(v,G="file_selected")=>{if(v)if(Ee(new Date().toISOString()),K(G),O(v),ae(null),v.type.startsWith("image/")){let W=URL.createObjectURL(v);D(W)}else D(null)},tt=()=>{O(null),D(null),V(null),H(null),ae(null),ot.current?.scrollIntoView({behavior:"smooth",block:"start"})},z=()=>{Ge(!0),ot.current?.scrollIntoView({behavior:"smooth",block:"start"})},He=async()=>{if(!N){x(M==="th"?"\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C":"Please choose a file","warn");return}let v=R==="csv"||N.name.toLowerCase().endsWith(".csv");J(!0),ae(null);try{let G=v?await window.CG.API_CLIENT.predictCsv(N,be||null):L?await window.CG.API_CLIENT.predictImages([{file:N,source:R},{file:L,source:"plant"}],be||null,Pe,we):await window.CG.API_CLIENT.predictImage(N,R,be||null,Pe,we);ae(G),x(M==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08":"Analysis complete","success")}catch(G){x(G.message,"error")}finally{J(!1)}};e(()=>{N&&R!=="csv"&&!U&&!Y&&He()},[N]);let Ve=[{value:"leaf",label:y("src_leaf")},{value:"plant",label:y("src_plant")},{value:"canopy",label:y("src_canopy")},{value:"csv",label:y("src_csv")}],P=Y?3:N||U?2:1;return React.createElement("div",{className:"space-y-6 max-w-6xl mx-auto diagnosis-workspace"},React.createElement("section",{className:"diagnosis-intro animate-fadeup"},React.createElement("div",null,React.createElement("span",{className:"diagnosis-kicker"},React.createElement(r,{name:"leaf",className:"w-4 h-4"})," CASSAVAGUARD VISION"),React.createElement("h1",{className:"txt"},M==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E40\u0E14\u0E35\u0E22\u0E27":"Understand cassava health from one photo"),React.createElement("p",{className:"txt-soft"},M==="th"?"\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07 \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E42\u0E14\u0E22\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E38\u0E14\u0E2B\u0E31\u0E27":"Photograph the standing plant to analyze health and estimate a non-destructive yield range.")),React.createElement("div",{className:"diagnosis-trust"},React.createElement("span",null,React.createElement(r,{name:"check",className:"w-4 h-4"}),M==="th"?"\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A":"No sign-in"),React.createElement("span",null,React.createElement(r,{name:"cpu",className:"w-4 h-4"}),M==="th"?"\u0E42\u0E21\u0E40\u0E14\u0E25 5 \u0E04\u0E25\u0E32\u0E2A":"5-class model"))),React.createElement("ol",{className:"workflow-steps","aria-label":M==="th"?"\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Analysis steps"},[[1,"camera",M==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E39\u0E1B":"Add photo"],[2,"brain",M==="th"?"\u0E1B\u0E23\u0E30\u0E21\u0E27\u0E25\u0E1C\u0E25\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34":"Auto analyze"],[3,"leaf",M==="th"?"\u0E14\u0E39\u0E1C\u0E25\u0E41\u0E25\u0E30 3D":"Result & 3D"]].map(([v,G,W])=>React.createElement("li",{key:v,className:P>=v?"active":""},React.createElement("span",null,React.createElement(r,{name:G,className:"w-4 h-4"})),React.createElement("b",null,W),v<3&&React.createElement("i",null)))),React.createElement("div",{className:"diagnosis-tip"},React.createElement(r,{name:"camera",className:"w-5 h-5"}),React.createElement("span",null,M==="th"?"\u0E40\u0E04\u0E25\u0E47\u0E14\u0E25\u0E31\u0E1A: \u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E49\u0E40\u0E2B\u0E47\u0E19\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E15\u0E31\u0E49\u0E07\u0E41\u0E15\u0E48\u0E42\u0E04\u0E19\u0E16\u0E36\u0E07\u0E22\u0E2D\u0E14 \u0E21\u0E35\u0E27\u0E31\u0E15\u0E16\u0E38\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E02\u0E19\u0E32\u0E14 \u0E41\u0E25\u0E30\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E22\u0E49\u0E2D\u0E19\u0E41\u0E2A\u0E07":"Tip: Show the whole plant from base to canopy, include a scale reference, and avoid backlight.")),React.createElement("div",{className:`grid gap-4 ${Y||U?"lg:grid-cols-5":""}`},React.createElement(n,{className:`${Y||U?"lg:col-span-2":"max-w-3xl w-full mx-auto"} animate-fadeup capture-card`},React.createElement("div",{ref:ot},React.createElement("div",{className:"flex items-center justify-between gap-3 mb-4"},React.createElement("div",null,React.createElement("div",{className:"txt font-bold text-lg"},N?M==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E":"Check your photo":M==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E39\u0E1B\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21":"Choose a photo to begin"),React.createElement("div",{className:"txt-dim text-sm mt-0.5"},M==="th"?"JPG \u0E2B\u0E23\u0E37\u0E2D PNG \u2022 \u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19\u0E09\u0E1A\u0E31\u0E1A\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E1F\u0E34\u0E25\u0E40\u0E15\u0E2D\u0E23\u0E4C":"JPG or PNG \u2022 use an original, unfiltered photo")),React.createElement(a,{tone:"green"},"1 ",M==="th"?"\u0E23\u0E39\u0E1B":"photo")),React.createElement("div",{onDragOver:v=>{v.preventDefault(),dt(!0)},onDragLeave:()=>dt(!1),onDrop:v=>{v.preventDefault(),dt(!1),nt(v.dataTransfer.files[0])},onClick:()=>Ze.current.click(),className:`capture-zone cursor-pointer ${Oe?"is-dragging":""} ${A?"has-preview":""}`},A?React.createElement("img",{src:A,alt:M==="th"?"\u0E23\u0E39\u0E1B\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Selected photo for analysis",className:"max-h-[350px] w-full rounded-2xl object-contain"}):N?React.createElement("div",{className:"txt-soft"},React.createElement(r,{name:"soil",className:"w-10 h-10 mx-auto mb-2 text-brand-400"}),React.createElement("div",{className:"txt font-medium text-sm"},N.name)):React.createElement("div",{className:"txt-dim"},React.createElement("div",{className:"capture-orb"},React.createElement(r,{name:"camera",className:"w-9 h-9"}),React.createElement("span",{className:"capture-orb-ring"})),React.createElement("div",{className:"txt text-xl font-extrabold"},M==="th"?"\u0E41\u0E15\u0E30\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E39\u0E1B\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"Tap to choose a whole-plant photo"),React.createElement("div",{className:"txt-dim text-sm mt-2"},M==="th"?"\u0E2B\u0E23\u0E37\u0E2D\u0E25\u0E32\u0E01\u0E23\u0E39\u0E1B\u0E21\u0E32\u0E27\u0E32\u0E07\u0E15\u0E23\u0E07\u0E19\u0E35\u0E49":"or drag and drop it here")),React.createElement("input",{ref:Ze,type:"file",className:"hidden",accept:R==="csv"?".csv":"image/*",onChange:v=>nt(v.target.files[0])})),R!=="csv"&&React.createElement("div",{className:"grid sm:grid-cols-2 gap-3 mt-4"},React.createElement("button",{onClick:()=>We(!0),className:"primary-action"},React.createElement(r,{name:"camera",className:"w-5 h-5"}),y("take_photo")),React.createElement("button",{onClick:()=>Ze.current.click(),className:"secondary-action"},React.createElement(r,{name:"upload",className:"w-5 h-5"}),y("upload_file"))),R==="leaf"&&N&&React.createElement("div",{className:"evidence-panel mt-4"},React.createElement("div",{className:"flex items-center justify-between gap-3"},React.createElement("div",null,React.createElement("div",{className:"txt text-sm font-bold"},M==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1C\u0E25\u0E17\u0E35\u0E48\u0E23\u0E2D\u0E1A\u0E14\u0E49\u0E32\u0E19\u0E02\u0E36\u0E49\u0E19":"Add a whole-plant view for stronger evidence"),React.createElement("p",{className:"txt-dim text-xs mt-1"},M==="th"?"\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E23\u0E27\u0E21\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E43\u0E1A\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E15\u0E23\u0E27\u0E08\u0E27\u0E48\u0E32\u0E1C\u0E25\u0E15\u0E23\u0E07\u0E01\u0E31\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48":"We fuse leaf and plant probabilities and report whether the views agree.")),React.createElement(a,{tone:L?"low":"slate"},L?"2/2":"1/2")),L?React.createElement("div",{className:"evidence-photo mt-3"},React.createElement("img",{src:X,alt:M==="th"?"\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Whole cassava plant"}),React.createElement("div",null,React.createElement("strong",{className:"txt text-sm block"},M==="th"?"\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E25\u0E49\u0E27":"Whole-plant view ready"),React.createElement("span",{className:"txt-dim text-xs block truncate max-w-[210px]"},L.name)),React.createElement("button",{onClick:()=>{V(null),H(null)},"aria-label":M==="th"?"\u0E25\u0E1A\u0E20\u0E32\u0E1E\u0E15\u0E49\u0E19":"Remove plant photo"},React.createElement(r,{name:"close",className:"w-4 h-4"}))):React.createElement("button",{type:"button",onClick:()=>ht.current?.click(),className:"add-evidence-button mt-3"},React.createElement(r,{name:"plus",className:"w-4 h-4"}),M==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"Add whole-plant photo"),React.createElement("input",{ref:ht,type:"file",className:"hidden",accept:"image/*",onChange:v=>{let G=v.target.files?.[0];G&&(V(G),H(URL.createObjectURL(G)),ae(null))}})),React.createElement("div",{className:"mt-3"},React.createElement("button",{type:"button",onClick:()=>Ge(v=>!v),className:"w-full flex items-center justify-between gap-2 txt-soft hover:txt text-xs font-semibold py-1.5 transition"},React.createElement("span",{className:"flex items-center gap-1.5"},React.createElement(r,{name:"cpu",className:"w-3.5 h-3.5"}),M==="th"?"\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07":"Advanced options"),React.createElement(r,{name:je?"close":"grid",className:"w-3.5 h-3.5"})),je&&React.createElement("div",{className:"mt-2 space-y-3 animate-fadeup rounded-xl border hair p-3"},React.createElement("div",null,React.createElement("label",{className:"txt-dim text-xs"},M==="th"?"\u0E0A\u0E19\u0E34\u0E14\u0E20\u0E32\u0E1E":"Image type"),React.createElement("div",{className:"mt-1"},React.createElement(o,{options:Ve,value:R,onChange:v=>{I(v),ae(null)}}))),R!=="csv"&&React.createElement("div",null,React.createElement("label",{className:"txt-dim text-xs"},M==="th"?"\u0E41\u0E1B\u0E25\u0E07\u0E1B\u0E25\u0E39\u0E01 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)":"Field (optional)"),React.createElement("select",{value:be,onChange:v=>ge(v.target.value),className:"w-full mt-1 glass rounded-xl px-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"",className:"bg-ink-800"},"\u2014 ",M==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E23\u0E39\u0E1B\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19":"Photo analysis only"," \u2014"),j.map(v=>React.createElement("option",{key:v.id,value:v.id,className:"bg-ink-800"},M==="th"&&v.name_th||v.name))),React.createElement("p",{className:"txt-dim text-xs mt-1.5"},M==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E40\u0E2A\u0E23\u0E34\u0E21\u0E1C\u0E25\u0E14\u0E49\u0E27\u0E22\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21":"Select to add weather, terrain, and satellite context.")),R==="csv"&&React.createElement("div",null,React.createElement("label",{className:"txt-dim text-xs"},y("select_field")),React.createElement("select",{value:be,onChange:v=>ge(v.target.value),className:"w-full mt-1 glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"",className:"bg-ink-800"},"\u2014 ",y("all_fields")," \u2014"),j.map(v=>React.createElement("option",{key:v.id,value:v.id,className:"bg-ink-800"},M==="th"&&v.name_th||v.name)))))),React.createElement("button",{onClick:He,disabled:U||!N,className:"analyze-action disabled:opacity-40"},U?React.createElement(React.Fragment,null,React.createElement(l,{className:"w-5 h-5"}),y("analyzing")):React.createElement(React.Fragment,null,React.createElement(r,{name:"brain",className:"w-5 h-5"}),y("analyze"))),R!=="csv"&&!N&&React.createElement("div",{className:"mt-4 grid sm:grid-cols-2 gap-2 text-sm"},React.createElement("div",{className:"rounded-xl border border-brand-500/25 bg-brand-500/10 p-3"},React.createElement("div",{className:"font-semibold text-brand-300 flex items-center gap-1"},React.createElement(r,{name:"check",className:"w-3.5 h-3.5"}),M==="th"?"\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30":"Good photo"),React.createElement("div",{className:"txt-soft mt-1 leading-relaxed"},M==="th"?"\u0E41\u0E2A\u0E07\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34 \u0E20\u0E32\u0E1E\u0E04\u0E21 \u0E43\u0E1A\u0E01\u0E34\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E27\u0E19\u0E43\u0E2B\u0E0D\u0E48 \u0E41\u0E25\u0E30\u0E16\u0E48\u0E32\u0E22\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21":"Natural light, sharp focus, leaf fills the frame, multiple angles.")),React.createElement("div",{className:"rounded-xl border border-rose-500/25 bg-rose-500/10 p-3"},React.createElement("div",{className:"font-semibold text-rose-300 flex items-center gap-1"},React.createElement(r,{name:"close",className:"w-3.5 h-3.5"}),M==="th"?"\u0E04\u0E27\u0E23\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48":"Retake"),React.createElement("div",{className:"txt-soft mt-1 leading-relaxed"},M==="th"?"\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E48\u0E19 \u0E22\u0E49\u0E2D\u0E19\u0E41\u0E2A\u0E07 \u0E43\u0E1A\u0E40\u0E25\u0E47\u0E01 \u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E23\u0E01 \u0E40\u0E1B\u0E35\u0E22\u0E01\u0E19\u0E49\u0E33 \u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E48\u0E32\u0E19\u0E1F\u0E34\u0E25\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2A\u0E35":"Blur, backlight, tiny leaf, clutter, wet leaf, or color filters."))))),(Y||U)&&React.createElement("div",{className:"lg:col-span-3 space-y-4"},U&&React.createElement(m,null),!U&&!Y&&React.createElement(n,{className:"min-h-[300px] grid place-items-center animate-fadeup"},React.createElement(c,{icon:"brain",text:M==="th"?"\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Upload a file to begin analysis"})),!U&&Y&&(Y.source==="csv"?React.createElement(b,{r:Y,onRetake:tt}):React.createElement(d,{r:Y,preview:A,fieldId:be,onRetake:tt,onOpenAdvanced:z})))),React.createElement(T,{open:ze,onClose:()=>We(!1),onCapture:v=>{nt(v,"camera_capture"),We(!1)}}))}function T({open:y,onClose:M,onCapture:x}){let{t:E,lang:R,toast:I}=window.CG.Store.useStore(),N=t(null),O=t(null),[A,D]=i(!1),[L,V]=i(null),[X,H]=i("environment"),U=()=>{O.current&&(O.current.getTracks().forEach(Ee=>Ee.stop()),O.current=null)},J=async Ee=>{U(),D(!1),V(null);try{let we=await navigator.mediaDevices.getUserMedia({video:{facingMode:Ee,width:{ideal:1280},height:{ideal:720}},audio:!1});O.current=we,N.current&&(N.current.srcObject=we,await N.current.play(),D(!0))}catch{I(E("cam_error"),"error"),M()}};e(()=>(y?J(X):U(),U),[y]);let Y=()=>{let Ee=N.current;if(!Ee)return;let we=document.createElement("canvas");we.width=Ee.videoWidth||640,we.height=Ee.videoHeight||480,we.getContext("2d").drawImage(Ee,0,0,we.width,we.height),V(we.toDataURL("image/jpeg",.92))},ae=()=>{if(!L)return;let Ee=atob(L.split(",")[1]),we=new Uint8Array(Ee.length);for(let j=0;j<Ee.length;j++)we[j]=Ee.charCodeAt(j);let K=new File([we],`capture_${Date.now()}.jpg`,{type:"image/jpeg"});U(),x(K)},Pe=()=>{let Ee=X==="environment"?"user":"environment";H(Ee),J(Ee)};return React.createElement(p,{open:y,onClose:()=>{U(),M()},title:E("take_photo")},React.createElement("div",{className:"relative rounded-2xl overflow-hidden bg-black aspect-[4/3] grid place-items-center"},React.createElement("video",{ref:N,playsInline:!0,muted:!0,className:`w-full h-full object-cover ${L?"hidden":""}`,style:{transform:X==="user"?"scaleX(-1)":"none"}}),L&&React.createElement("img",{src:L,alt:"capture",className:"w-full h-full object-cover"}),!A&&!L&&React.createElement("div",{className:"absolute inset-0 grid place-items-center bg-black/40"},React.createElement("div",{className:"flex flex-col items-center gap-2 text-white/80"},React.createElement(l,{className:"w-6 h-6"}),React.createElement("span",{className:"text-sm"},E("cam_starting")))),A&&!L&&React.createElement("div",{className:"absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none"})),React.createElement("div",{className:"flex items-center justify-center gap-3 mt-4"},L?React.createElement(React.Fragment,null,React.createElement("button",{onClick:()=>J(X),className:"glass rounded-xl px-5 py-3 flex items-center gap-2 txt-soft hover:txt font-medium"},React.createElement(r,{name:"history",className:"w-4 h-4"}),E("retake")),React.createElement("button",{onClick:ae,className:"grad-brand text-white font-semibold rounded-xl px-6 py-3 flex items-center gap-2 hover:brightness-110 transition shadow-lg shadow-brand-500/20"},React.createElement(r,{name:"check",className:"w-5 h-5"}),E("use_photo"))):React.createElement(React.Fragment,null,React.createElement("button",{onClick:Pe,title:E("switch_cam"),className:"glass rounded-xl w-12 h-12 grid place-items-center txt-soft hover:txt"},React.createElement(r,{name:"history",className:"w-5 h-5"})),React.createElement("button",{onClick:Y,disabled:!A,className:"grad-brand text-white font-semibold rounded-xl px-6 py-3 flex items-center gap-2 disabled:opacity-50 hover:brightness-110 transition shadow-lg shadow-brand-500/20"},React.createElement(r,{name:"camera",className:"w-5 h-5"}),E("capture")))))}function m(){let{Skeleton:y,Card:M}=window.CG.UI;return React.createElement(M,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center gap-3 mb-4"},React.createElement(l,{className:"w-5 h-5 text-brand-400"}),React.createElement("span",{className:"txt-soft text-sm"},"Running CassavaNet inference\u2026")),React.createElement("div",{className:"grid grid-cols-2 gap-4"},React.createElement(y,{className:"h-48"}),React.createElement("div",{className:"space-y-3"},React.createElement(y,{className:"h-6 w-3/4"}),React.createElement(y,{className:"h-4"}),React.createElement(y,{className:"h-4 w-2/3"}),React.createElement(y,{className:"h-20"}))))}function d({r:y,preview:M,fieldId:x,onRetake:E,onOpenAdvanced:R}){let{t:I,lang:N}=window.CG.Store.useStore(),O=y.top3[0],[A,D]=i("heat"),[L,V]=i(!1),X=y.auxiliary_findings?.find(Y=>Y.key==="whitefly"),[H,U]=i(x?void 0:null),J=H?.recommendations;return e(()=>{if(!x||!y.prediction_id){U(null);return}let Y=!1;return U(void 0),window.CG.API_CLIENT.predictionContext(y.prediction_id).then(ae=>{Y||U(ae)}).catch(ae=>{Y||U({evidence:[],recommendations:[],partial:!0,errors:[{source:"environment",error:ae.message}]})}),()=>{Y=!0}},[x,y.prediction_id]),React.createElement(React.Fragment,null,React.createElement(n,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center gap-2 mb-3 flex-wrap"},React.createElement(a,{tone:O.key,dot:!0},N==="th"?O.th:O.en),y.model_basis&&React.createElement(a,{tone:y.model_basis[O.key]==="trained_ml"?"low":"info"},y.model_basis[O.key]==="trained_ml"?N==="th"?"\u0E42\u0E21\u0E40\u0E14\u0E25\u0E17\u0E35\u0E48\u0E40\u0E17\u0E23\u0E19\u0E08\u0E23\u0E34\u0E07":"Trained model":N==="th"?"\u0E01\u0E0E\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07)":"Heuristic (no dataset yet)"),y.multi_view&&React.createElement(a,{tone:y.multi_view.agreement===1?"low":"medium"},N==="th"?`\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21 ${Math.round(y.multi_view.agreement*100)}% \u0E15\u0E23\u0E07\u0E01\u0E31\u0E19`:`Multi-view ${Math.round(y.multi_view.agreement*100)}% agreement`)),y.severity&&React.createElement("div",{className:"flex items-center gap-2 mb-3 flex-wrap"},React.createElement(a,{tone:y.severity.level==="severe"?"high":y.severity.level==="moderate"?"medium":"low"},N==="th"?{mild:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E40\u0E25\u0E47\u0E01\u0E19\u0E49\u0E2D\u0E22",moderate:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",severe:"\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E23\u0E38\u0E19\u0E41\u0E23\u0E07"}[y.severity.level]:{mild:"Mild",moderate:"Moderate",severe:"Severe"}[y.severity.level]),React.createElement("span",{className:"txt-dim text-[11px]"},N==="th"?y.severity.note_th:y.severity.note_en)),y.capture_context&&React.createElement(w,{context:y.capture_context}),React.createElement("div",{className:"flex items-center gap-4"},React.createElement(u,{value:O.confidence*100,size:84,label:I("confidence")}),React.createElement("div",{className:"flex-1 min-w-0"},y.health_score&&React.createElement("div",{className:"mb-2 flex items-center gap-2"},React.createElement("div",{className:"text-2xl font-bold txt tabular-nums"},y.health_score.score,React.createElement("span",{className:"text-xs txt-dim font-normal"},"/100")),React.createElement("span",{className:"txt-dim text-[11px]"},N==="th"?y.health_score.note_th:y.health_score.note_en)),y.requires_review?React.createElement("div",{className:"rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-xs leading-relaxed"},N==="th"?`\u0E1C\u0E25\u0E19\u0E35\u0E49\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E17\u0E32\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E01\u0E31\u0E1A\u0E41\u0E1B\u0E25\u0E07 (${(y.review_reasons||[]).join(", ")})`:`Expert review is required before field action (${(y.review_reasons||[]).join(", ")})`):React.createElement("p",{className:"txt-soft text-xs leading-relaxed"},N==="th"?y.explanation_th:y.explanation_en))),React.createElement("div",{className:"mt-4 glass rounded-xl p-3"},React.createElement("div",{className:"txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"},React.createElement(r,{name:"bulb",className:"w-3.5 h-3.5 text-amber-400"}),N==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33":"Recommendation"),x?H===void 0?React.createElement("div",{className:"flex items-center gap-2 txt-dim text-xs"},React.createElement(l,{className:"w-4 h-4"}),N==="th"?"\u0E1C\u0E25 AI \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E25\u0E49\u0E27 \xB7 \u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E2B\u0E25\u0E31\u0E07...":"AI result ready \xB7 loading weather, terrain and satellite evidence in the background..."):J&&J.length>0?React.createElement("ul",{className:"space-y-2"},J.slice(0,2).map((Y,ae)=>React.createElement("li",{key:ae,className:"text-xs"},React.createElement("div",{className:"flex items-center justify-between gap-2"},React.createElement("span",{className:"txt font-semibold"},N==="th"?Y.title_th:Y.title_en),React.createElement(a,{tone:Y.severity},Math.round(Y.confidence*100),"%")),(N==="th"?Y.actions_th:Y.actions_en)?.[0]&&React.createElement("div",{className:"txt-soft mt-0.5 flex items-start gap-1.5"},React.createElement(r,{name:"check",className:"w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0"}),(N==="th"?Y.actions_th:Y.actions_en)[0])))):React.createElement("p",{className:"txt-dim text-xs"},N==="th"?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E41\u0E1B\u0E25\u0E07\u0E19\u0E35\u0E49\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49":"No recommendations for this field right now."):React.createElement("button",{onClick:R,className:"text-brand-300 hover:text-brand-200 text-xs font-medium flex items-center gap-1.5 transition"},N==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E31\u0E1A\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E08\u0E32\u0E30\u0E08\u0E07":"Attach a field for tailored recommendations"," ",React.createElement("span",{"aria-hidden":"true"},"\u2192"))),H&&React.createElement("div",{className:"mt-3 rounded-xl border border-cyan-500/25 bg-cyan-500/[.07] p-3"},React.createElement("div",{className:"txt text-xs font-semibold flex items-center gap-1.5"},React.createElement(r,{name:"map",className:"w-4 h-4 text-cyan-300"}),N==="th"?"\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E08\u0E32\u0E01\u0E41\u0E1B\u0E25\u0E07":"Field evidence used"),React.createElement("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2"},H.evidence.map(Y=>{let ae={weather:N==="th"?"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28":"Weather",terrain:N==="th"?"\u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28":"Terrain",satellite:N==="th"?"\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21":"Satellite"},Pe=Y.source==="weather"?`${Y.summary?.rain_7d_mm??"\u2014"} mm/7d`:Y.source==="terrain"?`${Y.elevation_m??"\u2014"} m`:`NDVI ${Y.summary?.ndvi??"\u2014"}`;return React.createElement("div",{key:Y.source,className:"glass rounded-lg p-2"},React.createElement("div",{className:"txt-dim text-[10px]"},ae[Y.source]),React.createElement("div",{className:`text-xs font-semibold mt-0.5 ${Y.available?"txt":"text-amber-300"}`},Pe))})),React.createElement("p",{className:"txt-dim text-[10px] mt-2 leading-relaxed"},N==="th"?H.disclaimer_th:H.disclaimer_en)),React.createElement("button",{onClick:E,className:"w-full mt-4 glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium"},React.createElement(r,{name:"history",className:"w-4 h-4"}),N==="th"?"\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48":"Retake")),React.createElement(C,{result:y}),React.createElement("button",{onClick:()=>V(Y=>!Y),className:"w-full glass rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 txt-soft hover:txt text-xs font-semibold transition animate-fadeup"},React.createElement("span",{className:"flex items-center gap-1.5"},React.createElement(r,{name:"cpu",className:"w-3.5 h-3.5"}),N==="th"?"\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07":"Advanced Details"),React.createElement(r,{name:L?"close":"grid",className:"w-3.5 h-3.5"})),L&&React.createElement(React.Fragment,null,React.createElement(n,{className:"animate-fadeup"},React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},React.createElement("div",null,React.createElement("div",{className:"flex items-center gap-2 mb-2 flex-wrap"},React.createElement("span",{className:"txt-dim text-xs font-mono"},y.model.name," v",y.model.version)),React.createElement("div",{className:"relative rounded-xl overflow-hidden bg-black/20 grid place-items-center min-h-[220px]"},React.createElement("img",{src:A==="heat"?y.heatmap:M,alt:"analysis",className:"w-full object-contain max-h-[260px]"}),A==="whitefly"&&X?.image_size&&React.createElement("svg",{className:"absolute inset-0 w-full h-full pointer-events-none",viewBox:`0 0 ${X.image_size[0]} ${X.image_size[1]}`,preserveAspectRatio:"xMidYMid meet","aria-label":"Whitefly detection boxes"},X.detections.map((Y,ae)=>{let[Pe,Ee,we,K]=Y.box_xyxy;return React.createElement("g",{key:ae},React.createElement("rect",{x:Pe,y:Ee,width:we-Pe,height:K-Ee,fill:"rgba(245,158,11,.12)",stroke:"#f59e0b",strokeWidth:Math.max(2,X.image_size[0]/700)}))})),React.createElement("div",{className:"absolute bottom-2 right-2 flex gap-1"},React.createElement("button",{onClick:()=>D("original"),className:`text-[11px] px-2 py-1 rounded-lg ${A==="original"?"grad-brand text-white":"glass-strong txt-soft"}`},"Original"),React.createElement("button",{onClick:()=>D("heat"),className:`text-[11px] px-2 py-1 rounded-lg ${A==="heat"?"grad-brand text-white":"glass-strong txt-soft"}`},N==="th"?"\u0E08\u0E38\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D":"Attribution"),X&&React.createElement("button",{onClick:()=>D("whitefly"),className:`text-[11px] px-2 py-1 rounded-lg ${A==="whitefly"?"bg-amber-500 text-white":"glass-strong txt-soft"}`},N==="th"?`\u0E01\u0E23\u0E2D\u0E1A\u0E41\u0E21\u0E25\u0E07 ${X.count}`:`Whitefly boxes ${X.count}`))),React.createElement("p",{className:"txt-dim text-[11px] mt-2 flex items-center gap-1.5"},React.createElement(r,{name:"brain",className:"w-3.5 h-3.5"}),I("attention")," \xB7 ",y.inference_ms," ms")),React.createElement("div",{className:"flex flex-col"},React.createElement("div",{className:"txt-soft text-xs"},I("top3")),y.top3.map((Y,ae)=>React.createElement("div",{key:Y.key,className:"flex items-center gap-2 mt-1.5"},React.createElement("span",{className:`w-5 text-center text-[11px] font-bold ${ae===0?"text-brand-400":"txt-dim"}`},"#",ae+1),React.createElement("span",{className:"txt text-xs flex-1 truncate"},N==="th"?Y.th:Y.en),React.createElement("span",{className:"txt-soft text-xs font-mono tabular-nums"},(Y.confidence*100).toFixed(1),"%"))),React.createElement("div",{className:"glass rounded-xl p-3 mt-3"},React.createElement("div",{className:"txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"},React.createElement(r,{name:"bulb",className:"w-3.5 h-3.5 text-amber-400"}),I("explain")),React.createElement("p",{className:"txt-soft text-xs leading-relaxed"},N==="th"?y.explanation_th:y.explanation_en))))),y.auxiliary_findings?.length>0&&React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"check",title:N==="th"?"\u0E1C\u0E25\u0E08\u0E32\u0E01\u0E2B\u0E31\u0E27\u0E42\u0E21\u0E40\u0E14\u0E25\u0E40\u0E2A\u0E23\u0E34\u0E21":"Auxiliary model findings",sub:N==="th"?"\u0E1C\u0E25\u0E2D\u0E34\u0E2A\u0E23\u0E30 \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E19\u0E33\u0E44\u0E1B\u0E23\u0E27\u0E21\u0E01\u0E31\u0E1A softmax 5 \u0E04\u0E25\u0E32\u0E2A":"Independent findings; not mixed into the five-class softmax"}),React.createElement("div",{className:"space-y-3"},y.auxiliary_findings.map(Y=>React.createElement("div",{key:Y.key,className:`rounded-xl border p-3 ${Y.detected?"border-amber-500/35 bg-amber-500/10":"hair glass"}`},React.createElement("div",{className:"flex items-center justify-between gap-3 flex-wrap"},React.createElement("div",null,React.createElement("div",{className:"flex items-center gap-2"},React.createElement(a,{tone:Y.detected?"medium":"slate",dot:Y.detected},Y.detected?N==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A\u0E40\u0E2B\u0E19\u0E37\u0E2D threshold":"detected above threshold":N==="th"?"\u0E44\u0E21\u0E48\u0E16\u0E36\u0E07 threshold":"below threshold"),React.createElement("span",{className:"txt text-sm font-semibold"},N==="th"?Y.th:Y.en)),React.createElement("div",{className:"txt-dim text-[10px] font-mono mt-1"},Y.model.id,Y.model.test_macro_f1!=null?` \xB7 test macro-F1 ${(Y.model.test_macro_f1*100).toFixed(1)}%`:Y.model.test_map50!=null?` \xB7 test mAP50 ${(Y.model.test_map50*100).toFixed(1)}%`:"")),React.createElement("div",{className:"text-right"},React.createElement("div",{className:"txt text-xl font-bold tabular-nums"},Y.count!=null?`${Y.count} ${N==="th"?"\u0E15\u0E31\u0E27":"objects"}`:`${(Y.probability*100).toFixed(1)}%`),React.createElement("div",{className:"txt-dim text-[10px]"},Y.count!=null?`${N==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14":"max confidence"} ${(Y.probability*100).toFixed(1)}%`:`threshold ${(Y.threshold*100).toFixed(1)}%`))),React.createElement("div",{className:"h-2 rounded-full bg-white/5 overflow-hidden mt-3"},React.createElement("div",{className:`h-full rounded-full ${Y.detected?"bg-amber-400":"bg-slate-400"}`,style:{width:`${Y.probability*100}%`}})),React.createElement("div",{className:"txt-dim text-[11px] mt-2"},N==="th"?"\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E15\u0E23\u0E27\u0E08\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E41\u0E1B\u0E25\u0E07 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E2D\u0E34\u0E2A\u0E23\u0E30\u0E01\u0E31\u0E1A\u0E20\u0E32\u0E1E\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E17\u0E22":"Requires expert confirmation before field action and is not independently validated on Thai field photos."),Y.model.evaluation_warning&&React.createElement("div",{className:"mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200"},N==="th"?"\u0E04\u0E33\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E: \u0E04\u0E48\u0E32 mAP/recall \u0E40\u0E14\u0E34\u0E21\u0E2D\u0E32\u0E08\u0E2A\u0E39\u0E07\u0E40\u0E01\u0E34\u0E19\u0E08\u0E23\u0E34\u0E07\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E41\u0E1A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1A\u0E1A\u0E40\u0E01\u0E48\u0E32 \u0E15\u0E49\u0E2D\u0E07\u0E1D\u0E36\u0E01\u0E43\u0E2B\u0E21\u0E48\u0E42\u0E14\u0E22\u0E41\u0E22\u0E01\u0E17\u0E31\u0E49\u0E07 acquisition run \u0E01\u0E48\u0E2D\u0E19\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21":"Quality warning: legacy splitting may overstate mAP/recall. Retraining with whole acquisition-run groups is required before field use."))))),React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"leaf",title:I("symptoms")}),React.createElement("div",{className:"space-y-2"},y.symptoms.map((Y,ae)=>React.createElement("div",{key:ae,className:"flex items-center justify-between glass rounded-xl px-3 py-2"},React.createElement("span",{className:"txt text-sm"},N==="th"?Y.th:Y.en),React.createElement(a,{tone:Y.severity==="info"?"info":Y.severity},Y.severity==="info"?"\u2014":Math.round(Y.score*100)+"%"))))),React.createElement(n,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(s,{icon:"cpu",title:I("feat_imp")}),React.createElement("div",{className:"space-y-2.5"},y.feature_importance.map((Y,ae)=>React.createElement("div",{key:ae},React.createElement("div",{className:"flex justify-between text-xs mb-1"},React.createElement("span",{className:"txt-soft"},Y.feature),React.createElement("span",{className:"txt-dim font-mono"},(Y.importance*100).toFixed(0),"%")),React.createElement("div",{className:"h-2 rounded-full bg-white/5 overflow-hidden"},React.createElement("div",{className:"h-full grad-brand rounded-full",style:{width:Y.importance*100+"%",transition:"width 1s cubic-bezier(.2,.7,.2,1)"}}))))))),React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"grid",title:I("prob_dist"),sub:N==="th"?"\u0E2B\u0E31\u0E27\u0E42\u0E21\u0E40\u0E14\u0E25\u0E2B\u0E25\u0E31\u0E01 5 \u0E04\u0E25\u0E32\u0E2A\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19":"Primary five-class model head only"}),React.createElement(f,{items:Object.entries(y.probs).map(([Y,ae])=>{let Pe=window.CG._classMap&&window.CG._classMap[Y]||{th:Y,en:Y};return{key:Y,label:N==="th"?Pe.th:Pe.en,value:ae}}).sort((Y,ae)=>ae.value-Y.value)})),React.createElement("p",{className:"txt-dim text-[11px] text-center"},N==="th"?"CassavaGuard \u0E40\u0E1B\u0E47\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E32\u0E23\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E17\u0E35\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E42\u0E14\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23":"CassavaGuard is decision support, not a laboratory-confirmed diagnosis.")))}function w({context:y}){let{lang:M}=window.CG.Store.useStore(),x=y.is_actual_capture_time,E=new Date(y.captured_at),R=Number.isNaN(E.getTime())?y.captured_at:E.toLocaleString(M==="th"?"th-TH":"en-GB"),I=y.crop_timing?.days_after_planting_at_capture;return React.createElement("div",{className:"mb-3 rounded-xl border border-sky-500/25 bg-sky-500/[.07] p-3"},React.createElement("div",{className:"flex items-center justify-between gap-2 flex-wrap"},React.createElement("div",{className:"txt text-xs font-semibold flex items-center gap-1.5"},React.createElement(r,{name:"history",className:"w-4 h-4 text-sky-300"}),M==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E16\u0E48\u0E32\u0E22":"Capture-time analysis"),React.createElement(a,{tone:x?"low":"medium"},x?M==="th"?"\u0E40\u0E27\u0E25\u0E32\u0E08\u0E32\u0E01 EXIF":"EXIF time":M==="th"?"\u0E40\u0E27\u0E25\u0E32\u0E17\u0E14\u0E41\u0E17\u0E19":"Fallback time")),React.createElement("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs"},React.createElement("div",null,React.createElement("div",{className:"txt-dim text-[10px]"},M==="th"?"\u0E27\u0E31\u0E19\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32":"Date & time"),React.createElement("div",{className:"txt font-semibold mt-0.5"},R)),React.createElement("div",null,React.createElement("div",{className:"txt-dim text-[10px]"},M==="th"?"\u0E0A\u0E48\u0E27\u0E07\u0E27\u0E31\u0E19":"Day period"),React.createElement("div",{className:"txt font-semibold mt-0.5"},M==="th"?y.period_of_day.th:y.period_of_day.en)),React.createElement("div",null,React.createElement("div",{className:"txt-dim text-[10px]"},M==="th"?"\u0E0A\u0E48\u0E27\u0E07\u0E24\u0E14\u0E39":"Season"),React.createElement("div",{className:"txt font-semibold mt-0.5"},M==="th"?y.season.th:y.season.en)),React.createElement("div",null,React.createElement("div",{className:"txt-dim text-[10px]"},M==="th"?"\u0E2D\u0E32\u0E22\u0E38\u0E41\u0E1B\u0E25\u0E07 \u0E13 \u0E15\u0E2D\u0E19\u0E16\u0E48\u0E32\u0E22":"Crop age at capture"),React.createElement("div",{className:"txt font-semibold mt-0.5"},Number.isFinite(I)&&I>=0?M==="th"?`${I} \u0E27\u0E31\u0E19`:`${I} days`:"\u2014"))),!x&&React.createElement("p",{className:"text-amber-300 text-[10px] mt-2 leading-relaxed"},M==="th"?y.warnings?.[0]?.th:y.warnings?.[0]?.en),React.createElement("p",{className:"txt-dim text-[10px] mt-1"},M==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E27\u0E25\u0E32\u0E0A\u0E48\u0E27\u0E22\u0E2D\u0E18\u0E34\u0E1A\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E1A\u0E17\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19 \u0E44\u0E21\u0E48\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E04\u0E48\u0E32\u0E04\u0E27\u0E32\u0E21\u0E19\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E42\u0E23\u0E04\u0E02\u0E2D\u0E07\u0E42\u0E21\u0E40\u0E14\u0E25":"Time adds context only and does not alter model disease probabilities."))}function C({result:y}){let{lang:M}=window.CG.Store.useStore(),[x,E]=i(10),[R,I]=i(220),[N,O]=i(1),[A,D]=i(null),[L,V]=i(!1),[X,H]=i(""),[U,J]=i(!1),[Y,ae]=i(!1),[Pe,Ee]=i(null),[we,K]=i(""),[j,ce]=i("1"),[be,ge]=i(""),[Oe,dt]=i("KU50"),[ze,We]=i(""),[je,Ge]=i(""),[Ze,ht]=i([]),[ot,nt]=i(null),[tt,z]=i(""),[He,Ve]=i(null),[P,v]=i(null),[G,W]=i(!1),[ee,le]=i(!1),[de,Q]=i(null),[ne,me]=i("side"),[Se,he]=i(null),[ue,Ae]=i(!1),[Ie,Ue]=i(""),[B,fe]=i(""),[te,pe]=i("1"),[oe,se]=i(null),[ie,re]=i(!1),[Le,Be]=i(""),[it,mt]=i("whole"),Qe=y.top3[0],mn=y.severity?.level||(Qe.key==="healthy"?"mild":"moderate"),It=Number(y.health_score?.score??Math.round((1-Qe.confidence*.55)*100)),bt=Qe.key==="healthy"?0:{mild:2,moderate:4,severe:7}[mn]||4,$t=M==="th"?Qe.th:Qe.en,Qn=Math.max(.08,Math.min(1,(x-3)/9)),Yt=It>=80?"good":It>=60?"fair":"poor";e(()=>{if(!y.prediction_id)return;let S=!0,F=setTimeout(async()=>{V(!0),H("");try{let Z=await window.CG.API_CLIENT.yieldEstimate({prediction_id:y.prediction_id,age_months:x,height_cm:R,stem_count:N});S&&D(Z)}catch(Z){S&&H(Z.message||"Yield estimate unavailable")}finally{S&&V(!1)}},250);return()=>{S=!1,clearTimeout(F)}},[y.prediction_id,x,R,N]);let _t=A?.estimated_fresh_root_weight_kg_per_plant,Et=A?.estimated_root_size,ei=Number(oe?.estimated_fresh_root_weight_kg_per_plant?.midpoint||_t?.midpoint||2.5),is=oe?Math.cbrt(Number(B)/4e3):1,ui=Math.max(.28,Math.min(1.6,ei/4.2)),sa=Number(Et?.root_count||Math.round(4+Qn*3)),fi=Number(Et?.length_cm?.midpoint||28)*is,aa=Number(Et?.diameter_cm?.midpoint||5)*is,ra=async()=>{if(de){Ae(!0),Ue(""),he(null);try{he(await window.CG.API_CLIENT.rootSize(de,ne))}catch(S){Ue(S.message||"Root analysis unavailable")}finally{Ae(!1)}}},uo=async S=>{S.preventDefault(),re(!0),Be(""),se(null);try{se(await window.CG.API_CLIENT.rootWeight({volume_cm3_per_plant:Number(B),plant_count:Number(te)}))}catch(F){Be(F.message||"Root-weight analysis unavailable")}finally{re(!1)}},oa=async S=>{let F=await window.CG.API_CLIENT.startRootReconstruction({set_id:S.set_id,reference_span_cm:Number(tt)});for(Ve({...F,extractedFrames:S.view_count,videoQuality:S.quality});!["complete","failed"].includes(F.status);)await new Promise(Z=>setTimeout(Z,2e3)),F=await window.CG.API_CLIENT.rootReconstructionStatus(F.job_id),Ve(Z=>({...F,extractedFrames:Z?.extractedFrames,videoQuality:Z?.videoQuality}));if(F.status==="failed")throw new Error(F.error);fe(String(Math.round(F.result.volume_cm3))),se(F.result.weight)},fo=async()=>{Be(""),Ve({status:"uploading",progress:0});try{let S=await window.CG.API_CLIENT.saveRootImageSet(Ze);await oa(S)}catch(S){Be(S.message||"3-D reconstruction failed"),Ve(F=>({...F,status:"failed"}))}},po=async()=>{Be(""),Ve({status:"extracting_video",progress:0});try{await oa(await window.CG.API_CLIENT.saveRootVideoSet(P))}catch(S){Be(S.message||"Video reconstruction failed"),Ve(F=>({...F,status:"failed"}))}},la=async S=>{S.preventDefault(),ae(!0);try{let F=Ze.length>=3?await window.CG.API_CLIENT.saveRootImageSet(Ze):{images:[]},Z=await window.CG.API_CLIENT.saveHarvestMeasurement({prediction_id:y.prediction_id,age_months:x,height_cm:R,stem_count:N,variety:Oe,field_code:ze,season:je,latitude:ot?.latitude??null,longitude:ot?.longitude??null,root_volume_cm3_per_plant:B?Number(B):null,root_images:F.images,total_fresh_root_weight_kg:Number(we),harvested_plant_count:Number(j),notes:be});Ee(Z)}catch(F){Ee({error:F.message||"Unable to save measurement"})}finally{ae(!1)}};return React.createElement(n,{className:"animate-fadeup overflow-hidden cassava-model-card"},React.createElement("div",{className:"flex items-start justify-between gap-3 mb-3"},React.createElement("div",null,React.createElement("div",{className:"flex items-center gap-2"},React.createElement("span",{className:"model-live-dot"}),React.createElement("h3",{className:"txt text-base font-bold"},M==="th"?"\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Cassava plant model")),React.createElement("p",{className:"txt-dim text-xs mt-1"},M==="th"?"\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E08\u0E32\u0E01\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Generated automatically from the latest image result")),React.createElement(a,{tone:Qe.key},$t)),React.createElement("div",{className:"grid sm:grid-cols-[minmax(250px,1fr)_minmax(190px,.75fr)] gap-4 items-center"},React.createElement("div",{className:"plant-stage",role:"img","aria-label":M==="th"?`\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E2A\u0E32\u0E21\u0E21\u0E34\u0E15\u0E34\u0E15\u0E49\u0E19\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07 \u0E1C\u0E25 ${$t}`:`3D cassava plant simulation showing ${$t}`},React.createElement(_,{viewMode:it,disease:Qe.key,affectedCount:bt,severity:mn,maturity:Qn,health:It,stemCount:N,rootAbundance:ui,rootCount:sa,rootLength:fi,rootDiameter:aa}),React.createElement("div",{className:"plant-3d-badge"},"DIGITAL TWIN \u2022 ",M==="th"?"\u0E25\u0E32\u0E01\u0E2B\u0E21\u0E38\u0E19 \u2022 \u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E0B\u0E39\u0E21":"drag to rotate \u2022 scroll to zoom"),React.createElement("div",{className:"plant-view-switch",role:"group","aria-label":M==="th"?"\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E21\u0E38\u0E21\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07":"Choose model view"},React.createElement("button",{type:"button",className:it==="whole"?"active":"",onClick:()=>mt("whole")},React.createElement(r,{name:"leaf",className:"w-3.5 h-3.5"}),M==="th"?"\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"Whole plant"),React.createElement("button",{type:"button",className:it==="roots"?"active":"",onClick:()=>mt("roots")},React.createElement(r,{name:"cube",className:"w-3.5 h-3.5"}),M==="th"?"\u0E14\u0E39\u0E2B\u0E31\u0E27":"Root system")),React.createElement("div",{className:"plant-stage-legend"},React.createElement("span",null,React.createElement("i",{className:"legend-leaf"}),M==="th"?"\u0E17\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E21":"Canopy"),React.createElement("span",null,React.createElement("i",{className:"legend-root"}),M==="th"?"\u0E2B\u0E31\u0E27\u0E43\u0E15\u0E49\u0E14\u0E34\u0E19\u0E08\u0E33\u0E25\u0E2D\u0E07":"Simulated roots")),React.createElement("div",{className:"plant-stage-caption"},M==="th"?"\u0E20\u0E32\u0E1E\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E2A\u0E16\u0E32\u0E19\u0E01\u0E32\u0E23\u0E13\u0E4C \u2022 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E32\u0E23\u0E2A\u0E41\u0E01\u0E19\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E08\u0E23\u0E34\u0E07":"Scenario visualization \u2022 not an actual structural scan")),React.createElement("div",{className:"space-y-3"},React.createElement("div",{className:"model-stat"},React.createElement("span",{className:"txt-soft"},M==="th"?"\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13":"Estimated health"),React.createElement("strong",{className:"txt"},It,"/100"),React.createElement("div",{className:"model-meter"},React.createElement("span",{style:{width:`${Math.max(0,Math.min(100,It))}%`}}))),React.createElement("div",{className:"model-stat model-weight"},React.createElement("span",{className:"txt-soft"},M==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2B\u0E31\u0E27\u0E2A\u0E14\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13/\u0E15\u0E49\u0E19":"Estimated fresh root weight"),React.createElement("strong",{className:"txt"},L&&!_t?React.createElement(l,{className:"w-4 h-4"}):_t?`\u2248 ${_t.midpoint.toFixed(2)} kg`:"\u2014"),_t&&React.createElement("div",{className:"weight-range col-span-2"},React.createElement("span",{style:{left:`${Math.max(4,Math.min(88,_t.midpoint/_t.high*100))}%`}}),React.createElement("small",null,_t.low.toFixed(2),"\u2013",_t.high.toFixed(2)," kg"))),React.createElement("div",{className:"root-size-grid"},React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E2B\u0E31\u0E27":"Root count"),React.createElement("b",null,Et?`\u2248 ${Et.root_count}`:"\u2014")),React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22":"Mean length"),React.createElement("b",null,Et?`\u2248 ${Et.length_cm.midpoint.toFixed(1)} cm`:"\u2014")),React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E40\u0E2A\u0E49\u0E19\u0E1C\u0E48\u0E32\u0E19\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E01\u0E25\u0E32\u0E07":"Diameter"),React.createElement("b",null,Et?`\u2248 ${Et.diameter_cm.midpoint.toFixed(1)} cm`:"\u2014")),React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14":"Size class"),React.createElement("b",null,Et?M==="th"?{small:"\u0E40\u0E25\u0E47\u0E01",medium:"\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",large:"\u0E43\u0E2B\u0E0D\u0E48"}[Et.size_class]:Et.size_class:"\u2014"))),React.createElement("div",{className:"model-stat"},React.createElement("span",{className:"txt-soft"},M==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E02\u0E2D\u0E07\u0E15\u0E49\u0E19":"Plant condition"),React.createElement("strong",{className:Yt==="good"?"text-emerald-500":Yt==="fair"?"text-amber-500":"text-rose-500"},M==="th"?{good:"\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E14\u0E35",fair:"\u0E04\u0E27\u0E23\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07",poor:"\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07"}[Yt]:{good:"Good",fair:"Monitor",poor:"At risk"}[Yt])),React.createElement("div",{className:"model-stat"},React.createElement("span",{className:"txt-soft"},M==="th"?"\u0E43\u0E1A\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E43\u0E19\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07":"Affected leaves in model"),React.createElement("strong",{className:"txt"},bt,"/8")))),React.createElement("button",{type:"button",className:"add-evidence-button mt-4",onClick:()=>le(S=>!S)},React.createElement(r,{name:"cpu",className:"w-4 h-4"}),M==="th"?"\u0E1B\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)":"Refine optional inputs"),ee&&React.createElement("div",{className:"model-inputs mt-3"},React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E2D\u0E32\u0E22\u0E38\u0E1E\u0E37\u0E0A":"Plant age"," ",React.createElement("b",null,x," ",M==="th"?"\u0E40\u0E14\u0E37\u0E2D\u0E19":"months")),React.createElement("input",{type:"range",min:"3",max:"18",value:x,onChange:S=>E(Number(S.target.value))})),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13":"Approx. height"," ",React.createElement("b",null,R," cm")),React.createElement("input",{type:"range",min:"50",max:"400",step:"10",value:R,onChange:S=>I(Number(S.target.value))})),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E25\u0E33\u0E15\u0E49\u0E19":"Stem count"," ",React.createElement("b",null,N)),React.createElement("input",{type:"range",min:"1",max:"6",value:N,onChange:S=>O(Number(S.target.value))}))),React.createElement("div",{className:"rounded-xl bg-brand-500/10 border border-brand-500/20 p-3 mt-4"},React.createElement("strong",{className:"txt text-sm"},M==="th"?"\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E02\u0E38\u0E14":"Non-destructive yield estimate"),React.createElement("p",{className:"txt-soft text-xs mt-1"},M==="th"?"\u0E04\u0E33\u0E19\u0E27\u0E13\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19 \u0E2D\u0E32\u0E22\u0E38 \u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07 \u0E08\u0E33\u0E19\u0E27\u0E19\u0E25\u0E33\u0E15\u0E49\u0E19 \u0E1C\u0E25\u0E42\u0E23\u0E04 \u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07 \u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E13\u0E4C \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E17\u0E35\u0E48\u0E27\u0E31\u0E14\u0E42\u0E14\u0E22\u0E15\u0E23\u0E07":"Uses the whole-plant image, age, height, stems, disease and field context. This is a prediction interval, not a direct weight measurement.")),React.createElement("button",{type:"button",className:"add-evidence-button mt-3",onClick:()=>W(S=>!S)},React.createElement(r,{name:"check",className:"w-4 h-4"}),M==="th"?"\u0E42\u0E2B\u0E21\u0E14\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E14\u0E49\u0E27\u0E22\u0E01\u0E32\u0E23\u0E02\u0E38\u0E14\u0E41\u0E25\u0E30 3D (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)":"Optional harvest/3-D validation mode"),G&&React.createElement(React.Fragment,null,React.createElement("div",{className:"root-ml-panel mt-4"},React.createElement("div",null,React.createElement("strong",{className:"txt"},M==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E02\u0E19\u0E32\u0E14\u0E23\u0E32\u0E01\u0E14\u0E49\u0E27\u0E22 ML \u0E08\u0E23\u0E34\u0E07":"Real ML root-size analysis"),React.createElement("p",{className:"txt-dim text-xs mt-1"},M==="th"?"\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E2B\u0E31\u0E27\u0E17\u0E35\u0E48\u0E02\u0E38\u0E14\u0E41\u0E25\u0E49\u0E27\u0E1A\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E2A\u0E35\u0E14\u0E33 \u0E21\u0E35\u0E27\u0E07\u0E01\u0E25\u0E21\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07 2 \u0E19\u0E34\u0E49\u0E27":"Use an excavated-root photo on black cloth with a 2-inch reference disk.")),React.createElement("div",{className:"grid sm:grid-cols-[1fr_auto_auto] gap-2 mt-3"},React.createElement("input",{type:"file",accept:"image/*",onChange:S=>{Q(S.target.files[0]||null),he(null)}}),React.createElement("select",{value:ne,onChange:S=>me(S.target.value)},React.createElement("option",{value:"side"},M==="th"?"\u0E21\u0E38\u0E21\u0E14\u0E49\u0E32\u0E19\u0E02\u0E49\u0E32\u0E07":"Side view"),React.createElement("option",{value:"top"},M==="th"?"\u0E21\u0E38\u0E21\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19":"Top view")),React.createElement("button",{type:"button",className:"primary-action px-4",disabled:!de||ue,onClick:ra},ue?React.createElement(l,{className:"w-4 h-4"}):React.createElement(r,{name:"brain",className:"w-4 h-4"}),M==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E23\u0E32\u0E01":"Analyze roots")),Ie&&React.createElement("p",{className:"text-rose-500 text-xs mt-2"},Ie),Se&&React.createElement("div",{className:"root-ml-results mt-3"},Object.entries(Se.measurements).map(([S,F])=>React.createElement("div",{key:S},React.createElement("span",null,S),React.createElement("b",null,Number(F).toLocaleString()))),React.createElement("p",null,M==="th"?`\u0E42\u0E21\u0E40\u0E14\u0E25 ${Se.model_id} \u2022 \u0E1D\u0E36\u0E01 ${Se.training_samples} \u0E20\u0E32\u0E1E \u2022 \u0E1C\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E48\u0E27\u0E22 DIRT`:`${Se.model_id} \u2022 ${Se.training_samples} training images \u2022 DIRT units`))),React.createElement("form",{className:"root-ml-panel mt-4",onSubmit:uo},React.createElement("div",null,React.createElement("strong",{className:"txt"},M==="th"?"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E14\u0E49\u0E27\u0E22 ML":"ML fresh-root weight analysis"),React.createElement("p",{className:"txt-dim text-xs mt-1"},M==="th"?"\u0E01\u0E23\u0E2D\u0E01\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E23\u0E32\u0E01\u0E2A\u0E14\u0E15\u0E48\u0E2D\u0E15\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E02\u0E38\u0E14 \u0E27\u0E31\u0E14\u0E14\u0E49\u0E27\u0E22\u0E16\u0E31\u0E07\u0E25\u0E49\u0E19/\u0E01\u0E32\u0E23\u0E41\u0E17\u0E19\u0E17\u0E35\u0E48\u0E19\u0E49\u0E33 \u0E2B\u0E23\u0E37\u0E2D\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07 3D \u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21":"Enter excavated fresh-root volume per plant measured by water displacement or multi-view 3-D reconstruction.")),React.createElement("div",{className:"grid sm:grid-cols-[1fr_1fr_auto] gap-2 mt-3"},React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E23\u0E32\u0E01/\u0E15\u0E49\u0E19 (\u0E0B\u0E21.\xB3)":"Root volume/plant (cm\xB3)"),React.createElement("input",{type:"number",min:"200",max:"20000",step:"1",required:!0,placeholder:"\u0E40\u0E0A\u0E48\u0E19 4000",value:B,onChange:S=>fe(S.target.value)})),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19":"Plant count"),React.createElement("input",{type:"number",min:"1",max:"1000",step:"1",required:!0,value:te,onChange:S=>pe(S.target.value)})),React.createElement("button",{type:"submit",className:"primary-action px-4 self-end",disabled:ie||!B},ie?React.createElement(l,{className:"w-4 h-4"}):React.createElement(r,{name:"brain",className:"w-4 h-4"}),M==="th"?"\u0E04\u0E33\u0E19\u0E27\u0E13\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01":"Estimate weight")),React.createElement("div",{className:"mt-4 pt-4 border-t border-white/10"},React.createElement("strong",{className:"txt text-sm"},M==="th"?"\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23 3D \u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21":"Automatic multi-view 3-D volume"),React.createElement("div",{className:"rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mt-2"},React.createElement("b",{className:"txt text-sm"},M==="th"?"\u0E41\u0E19\u0E30\u0E19\u0E33: \u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E40\u0E14\u0E34\u0E19\u0E23\u0E2D\u0E1A\u0E2B\u0E31\u0E27\u0E21\u0E31\u0E19":"Recommended: upload an orbit video"),React.createElement("div",{className:"grid sm:grid-cols-[1fr_180px_auto] gap-2 mt-2"},React.createElement("input",{type:"file",accept:"video/mp4,video/quicktime,video/webm,.m4v",onChange:S=>v(S.target.files?.[0]||null)}),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E01\u0E27\u0E49\u0E32\u0E07\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 (\u0E0B\u0E21.)":"Measured max span (cm)"),React.createElement("input",{type:"number",min:"5",max:"300",step:"0.1",value:tt,onChange:S=>z(S.target.value)})),React.createElement("button",{type:"button",className:"primary-action px-4 self-end",disabled:!P||!tt||He&&!["complete","failed"].includes(He.status),onClick:po},React.createElement(r,{name:"play",className:"w-4 h-4"}),M==="th"?"\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D \u2192 3D":"Video \u2192 3-D")),React.createElement("p",{className:"txt-dim text-xs mt-2"},M==="th"?"\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A MP4/MOV/WebM \u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 250 MB \u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27 4\u201390 \u0E27\u0E34\u0E19\u0E32\u0E17\u0E35 \u0E23\u0E30\u0E1A\u0E1A\u0E04\u0E31\u0E14\u0E40\u0E1F\u0E23\u0E21\u0E04\u0E21\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E0B\u0E49\u0E33\u0E43\u0E2B\u0E49\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34":"MP4/MOV/WebM up to 250 MB, 4\u201390 seconds. Sharp, non-duplicate frames are selected automatically.")),React.createElement("p",{className:"txt-dim text-xs mt-3"},M==="th"?"\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21\u0E40\u0E2D\u0E07":"Or select multiple photos manually"),React.createElement("div",{className:"grid sm:grid-cols-[1fr_180px_auto] gap-2 mt-2"},React.createElement("input",{type:"file",accept:"image/*",multiple:!0,onChange:S=>ht(Array.from(S.target.files||[]))}),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E01\u0E27\u0E49\u0E32\u0E07\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 (\u0E0B\u0E21.)":"Measured max span (cm)"),React.createElement("input",{type:"number",min:"5",max:"300",step:"0.1",value:tt,onChange:S=>z(S.target.value)})),React.createElement("button",{type:"button",className:"primary-action px-4 self-end",disabled:Ze.length<12||!tt||He&&!["complete","failed"].includes(He.status),onClick:fo},React.createElement(r,{name:"cube",className:"w-4 h-4"}),M==="th"?"\u0E2A\u0E23\u0E49\u0E32\u0E07 3D":"Build 3-D")),React.createElement("p",{className:"txt-dim text-xs mt-2"},M==="th"?`\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 12 \u0E20\u0E32\u0E1E (\u0E41\u0E19\u0E30\u0E19\u0E33 20\u201330) \u0E40\u0E14\u0E34\u0E19\u0E16\u0E48\u0E32\u0E22\u0E23\u0E2D\u0E1A\u0E2B\u0E31\u0E27\u0E43\u0E2B\u0E49\u0E20\u0E32\u0E1E\u0E0B\u0E49\u0E2D\u0E19\u0E01\u0E31\u0E19 70\u201380% \u2022 \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 ${Ze.length} \u0E20\u0E32\u0E1E`:`Use at least 12 views (20\u201330 recommended) with 70\u201380% overlap \u2022 ${Ze.length} selected`),He&&React.createElement("div",{className:"model-meter mt-2"},React.createElement("span",{style:{width:`${He.progress||0}%`}})),He&&React.createElement("p",{className:"text-xs txt-soft mt-1"},He.status," ",He.stage?`\u2022 ${He.stage}`:""," \u2022 ",He.progress||0,"%"),He?.extractedFrames&&React.createElement("p",{className:"text-xs text-emerald-500 mt-1"},M==="th"?`\u0E04\u0E31\u0E14\u0E08\u0E32\u0E01\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E41\u0E25\u0E49\u0E27 ${He.extractedFrames} \u0E40\u0E1F\u0E23\u0E21`:`${He.extractedFrames} video frames selected`)),Le&&React.createElement("p",{className:"text-rose-500 text-xs mt-2"},Le),oe&&React.createElement("div",{className:"root-ml-results mt-3"},React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2A\u0E14/\u0E15\u0E49\u0E19":"Fresh weight/plant"),React.createElement("b",null,oe.estimated_fresh_root_weight_kg_per_plant.midpoint.toFixed(2)," kg")),React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E0A\u0E48\u0E27\u0E07\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C 95%":"95% prediction range"),React.createElement("b",null,oe.estimated_fresh_root_weight_kg_per_plant.low.toFixed(2),"\u2013",oe.estimated_fresh_root_weight_kg_per_plant.high.toFixed(2)," kg")),React.createElement("div",null,React.createElement("span",null,M==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E23\u0E27\u0E21":"Total weight"),React.createElement("b",null,oe.estimated_total_weight_kg.midpoint.toFixed(2)," kg")),React.createElement("p",null,M==="th"?`\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E0A\u0E31\u0E48\u0E07\u0E08\u0E23\u0E34\u0E07 ${oe.model.samples} \u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 / ${oe.model.cultivars} \u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C \u2022 \u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E41\u0E1A\u0E1A\u0E40\u0E27\u0E49\u0E19\u0E17\u0E35\u0E25\u0E30\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C: R\xB2 ${oe.model.r2.toFixed(3)}, MAE ${oe.model.mae_kg.toFixed(2)} \u0E01\u0E01. \u2022 ${oe.in_training_domain?"\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1D\u0E36\u0E01":"\u0E2D\u0E22\u0E39\u0E48\u0E19\u0E2D\u0E01\u0E0A\u0E48\u0E27\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1D\u0E36\u0E01\u2014\u0E0A\u0E48\u0E27\u0E07\u0E16\u0E39\u0E01\u0E02\u0E22\u0E32\u0E22"}`:`${oe.model.samples} weighed samples / ${oe.model.cultivars} cultivars \u2022 leave-one-cultivar-out R\xB2 ${oe.model.r2.toFixed(3)}, MAE ${oe.model.mae_kg.toFixed(2)} kg \u2022 ${oe.in_training_domain?"within training range":"outside training range\u2014interval widened"}`)),React.createElement("p",{className:"text-xs txt-soft mt-3"},M==="th"?"\u0E2A\u0E33\u0E04\u0E31\u0E0D: \u0E20\u0E32\u0E1E\u0E43\u0E1A\u0E43\u0E0A\u0E49\u0E1A\u0E2D\u0E01\u0E42\u0E23\u0E04 \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E2B\u0E31\u0E27\u0E43\u0E15\u0E49\u0E14\u0E34\u0E19 \u0E08\u0E36\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E27\u0E31\u0E14\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E23\u0E32\u0E01\u0E2B\u0E25\u0E31\u0E07\u0E02\u0E38\u0E14 \u0E23\u0E30\u0E1A\u0E1A\u0E19\u0E35\u0E49\u0E22\u0E31\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E07\u0E32\u0E19\u0E17\u0E14\u0E25\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49\u0E41\u0E17\u0E19\u0E01\u0E32\u0E23\u0E0A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D\u0E02\u0E32\u0E22":"Important: a leaf photo cannot reveal underground roots. Measure excavated-root volume. This experimental model does not replace trade weighing."))),React.createElement("p",{className:"mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs txt-soft leading-relaxed"},X||(A?M==="th"?`${A.disclaimer_th} \u0E08\u0E33\u0E19\u0E27\u0E19\u0E41\u0E25\u0E30\u0E02\u0E19\u0E32\u0E14\u0E2B\u0E31\u0E27\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E2D\u0E32\u0E22\u0E38 \u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07 \u0E08\u0E33\u0E19\u0E27\u0E19\u0E25\u0E33\u0E15\u0E49\u0E19 \u0E41\u0E25\u0E30\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E42\u0E23\u0E04`:`${A.disclaimer_en} Root count and dimensions are scenarios based on age, height, stem count and disease result.`:M==="th"?"\u0E01\u0E33\u0E25\u0E31\u0E07\u0E04\u0E33\u0E19\u0E27\u0E13\u0E0A\u0E48\u0E27\u0E07\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E01\u0E23\u0E2D\u0E01":"Calculating a range from the supplied observations")),React.createElement("button",{type:"button",onClick:()=>J(S=>!S),className:"add-evidence-button mt-3","aria-expanded":U},React.createElement(r,{name:"check",className:"w-4 h-4"}),M==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E17\u0E35\u0E48\u0E02\u0E38\u0E14\u0E0A\u0E31\u0E48\u0E07\u0E08\u0E23\u0E34\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E42\u0E21\u0E40\u0E14\u0E25":"Record an actual harvest weight to improve the model"),U&&React.createElement("form",{onSubmit:la,className:"harvest-form mt-3"},React.createElement("div",{className:"grid sm:grid-cols-2 gap-3"},React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2B\u0E31\u0E27\u0E2A\u0E14\u0E23\u0E27\u0E21 (\u0E01\u0E01.)":"Total fresh-root weight (kg)"),React.createElement("input",{type:"number",min:"0.02",max:"2000",step:"0.01",required:!0,value:we,onChange:S=>K(S.target.value)})),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E38\u0E14\u0E0A\u0E31\u0E48\u0E07":"Number of harvested plants"),React.createElement("input",{type:"number",min:"1",max:"1000",step:"1",required:!0,value:j,onChange:S=>ce(S.target.value)}))),React.createElement("div",{className:"grid sm:grid-cols-3 gap-3 mt-3"},React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Variety"),React.createElement("input",{required:!0,value:Oe,onChange:S=>dt(S.target.value)})),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07":"Field code"),React.createElement("input",{required:!0,value:ze,onChange:S=>We(S.target.value),placeholder:"FIELD-001"})),React.createElement("label",null,React.createElement("span",null,M==="th"?"\u0E24\u0E14\u0E39/\u0E23\u0E2D\u0E1A\u0E1B\u0E25\u0E39\u0E01":"Season"),React.createElement("input",{required:!0,value:je,onChange:S=>Ge(S.target.value),placeholder:"2026-rainy"}))),React.createElement("label",{className:"mt-3"},React.createElement("span",null,M==="th"?"\u0E20\u0E32\u0E1E\u0E23\u0E32\u0E01\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21 (\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 3; \u0E41\u0E19\u0E30\u0E19\u0E33 20\u201330 \u0E20\u0E32\u0E1E)":"Multi-view root photos (minimum 3; recommended 20\u201330)"),React.createElement("input",{type:"file",accept:"image/*",multiple:!0,required:!0,onChange:S=>ht(Array.from(S.target.files||[]))})),React.createElement("button",{type:"button",className:"add-evidence-button mt-3",onClick:()=>navigator.geolocation?.getCurrentPosition(S=>nt({latitude:S.coords.latitude,longitude:S.coords.longitude}))},React.createElement(r,{name:"map",className:"w-4 h-4"}),ot?`${ot.latitude.toFixed(5)}, ${ot.longitude.toFixed(5)}`:M==="th"?"\u0E41\u0E19\u0E1A\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E41\u0E1B\u0E25\u0E07 (\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E43\u0E08)":"Attach field coordinates (optional)"),React.createElement("label",{className:"mt-3"},React.createElement("span",null,M==="th"?"\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E40\u0E01\u0E47\u0E1A\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 (\u0E16\u0E49\u0E32\u0E21\u0E35)":"Sampling notes (optional)"),React.createElement("textarea",{rows:"2",maxLength:"1000",value:be,onChange:S=>ge(S.target.value)})),Pe&&React.createElement("p",{className:`text-sm mt-3 ${Pe.error?"text-rose-400":"text-emerald-500"}`},Pe.error||(M==="th"?`\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E49\u0E27: ${Pe.weight_kg_per_plant} \u0E01\u0E01./\u0E15\u0E49\u0E19`:`Saved: ${Pe.weight_kg_per_plant} kg/plant`)),React.createElement("button",{className:"primary-action w-full mt-3",disabled:Y||!!(Pe&&!Pe.error)},Y?React.createElement(l,{className:"w-4 h-4"}):React.createElement(r,{name:"check",className:"w-4 h-4"}),M==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E27\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07":"Save measured value")))}function _({viewMode:y,disease:M,affectedCount:x,severity:E,maturity:R,health:I,stemCount:N,rootAbundance:O,rootCount:A,rootLength:D,rootDiameter:L}){let V=t(null);return e(()=>{let X=V.current;if(!X)return;let H;try{H=new lo({canvas:X,antialias:!0,alpha:!0,powerPreference:"high-performance"})}catch{X.dataset.webglUnavailable="true";return}H.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),H.outputColorSpace=zt,H.toneMapping=qs,H.toneMappingExposure=1.12,H.shadowMap.enabled=!0,H.shadowMap.type=mr;let U=new _s,J=new Rt(36,1,.1,100),Y=y==="roots";J.position.set(Y?.1:.15,Y?-.4:2.45,Y?5.2:7.6),J.lookAt(0,Y?-.9:1.05,0),U.fog=new vs(465698,.045),U.add(new zs(14350591,4926742,2.35));let ae=new $i(16777215,3.2);ae.position.set(4,7,5),ae.castShadow=!0,ae.shadow.mapSize.set(1024,1024),ae.shadow.camera.near=.5,ae.shadow.camera.far=18,U.add(ae);let Pe=new $i(2282478,1.1);Pe.position.set(-4,3,-4),U.add(Pe);let Ee=new Hs(16758891,1.2,10);Ee.position.set(2.5,.2,3.5),U.add(Ee);let we=new nn;U.add(we);let K=[],j=[],ce=ie=>{let re=new Bs(ie);return K.push(re),re},be=(ie,re)=>{j.push(ie);let Le=new Xt(ie,re);return Le.castShadow=!0,Le.receiveShadow=!0,Le},ge=ce({color:2598987,roughness:.68,side:Ot}),Oe=ce({color:6016871,roughness:.7,side:Ot}),ze=ce({color:{cbb:8142098,cbsd:15381256,cmd:16436245,cgm:10118160}[M]||10576391,roughness:.8,side:Ot}),We=ce({color:4160826,roughness:.96}),je=ce({color:7181389,roughness:1}),Ge=ce({color:11818325,roughness:.86}),Ze=ce({color:13207372,roughness:.92,metalness:.01}),ht=ce({color:14722667,roughness:.9}),ot=ce({color:8474669,roughness:1}),nt=ce({color:5846303,roughness:1,transparent:!0,opacity:.52}),tt=[],z=new nn,He=new nn;we.add(z,He);let Ve=be(new ki(2.15,2,.58,64,1,!0,0,Math.PI*1.72),nt);Ve.position.y=-.72,Ve.receiveShadow=!0,we.add(Ve);let P=be(new ri(2.14,64,.2,Math.PI*1.68),ce({color:7423270,roughness:1,side:Ot}));P.rotation.x=-Math.PI/2,P.position.y=-.43,we.add(P);let v=be(new ri(2.35,64),ce({color:133902,transparent:!0,opacity:.34,roughness:1}));v.rotation.x=-Math.PI/2,v.position.y=-1.83,v.receiveShadow=!0,we.add(v);let G=2.55+R*.45,W=(ie,re,Le,Be,it=8)=>{let mt=new k().subVectors(re,ie),Qe=be(new ki(Le*.78,Le,mt.length(),it),Be);return Qe.position.copy(ie).add(re).multiplyScalar(.5),Qe.quaternion.setFromUnitVectors(new k(0,1,0),mt.clone().normalize()),Qe},ee=Math.max(1,Math.min(4,Math.round(N||1)));for(let ie=0;ie<ee;ie+=1){let re=ie/ee*Math.PI*2+.35,Le=new k(Math.cos(re)*ie*.045,-.48,Math.sin(re)*ie*.045),Be=new k(Math.cos(re)*ie*.16,G-.48-ie*.08,Math.sin(re)*ie*.16);z.add(W(Le,Be,.075-ie*.006,We,14));for(let it=0;it<8;it+=1){let mt=(it+1)/10,Qe=be(new Wi(.077-ie*.006,.009,5,18),je);Qe.position.lerpVectors(Le,Be,mt),Qe.rotation.x=Math.PI/2,z.add(Qe)}}let le=Math.max(3,Math.min(12,Math.round(A||6))),de=Math.max(.62,Math.min(1.45,Number(D||28)/28)),Q=Math.max(.62,Math.min(1.55,Number(L||5)/5));for(let ie=0;ie<le;ie+=1){let re=ie/le*Math.PI*2+.28,Le=.8+ie%4*.075,Be=[new xe(.018,0),new xe(.08*Q,.08),new xe(.18*Q*Le*O,.26),new xe(.2*Q*Le*O,.56),new xe(.15*Q*Le*O,.82),new xe(.055*Q,1.05),new xe(.008,1.18)],it=be(new Ds(Be,28),ie%3===0?ht:Ze);it.scale.y=de*Le,it.position.set(Math.cos(re)*.3,-.48,Math.sin(re)*.3),it.rotation.z=Math.cos(re)*(.3+ie%2*.1),it.rotation.x=Math.sin(re)*(.3+ie%2*.1),it.rotation.y=-re,He.add(it);for(let It=1;It<=3;It+=1){let bt=be(new Wi(.12*Q*Le*O,.006,5,24),ot);bt.position.set(Math.cos(re)*(.3+It*.035),-.48-It*.22*de*Le,Math.sin(re)*(.3+It*.035)),bt.rotation.x=Math.PI/2,bt.rotation.z=Math.cos(re)*.32,He.add(bt)}let mt=new k(Math.cos(re)*.68,-1.34*de*Le,Math.sin(re)*.68),Qe=new k(Math.cos(re+.18)*.92,mt.y-.26,Math.sin(re+.18)*.92);He.add(W(mt,Qe,.014,ot,6));let mn=new Gi([Qe,new k(Math.cos(re+.28)*1.05,Qe.y-.16,Math.sin(re+.28)*1.05),new k(Math.cos(re+.42)*1.18,Qe.y-.34,Math.sin(re+.42)*1.18)]);He.add(be(new Os(mn,10,.008,5,!1),ot))}let ne=new Vi;ne.moveTo(0,0),ne.bezierCurveTo(.09,.08,.19,.3,.13,.62),ne.bezierCurveTo(.07,.88,0,1.04,0,1.1),ne.bezierCurveTo(0,1.04,-.07,.88,-.13,.62),ne.bezierCurveTo(-.19,.3,-.09,.08,0,0);let me=14;for(let ie=0;ie<me;ie+=1){let re=ie*2.399963,Le=.62+ie%5*.43,Be=.72+ie%3*.13,it=new k(0,Le,0),mt=new k(Math.cos(re)*Be,Le+.18,Math.sin(re)*Be);z.add(W(it,mt,.022,Ge));let Qe=new nn;Qe.position.copy(mt),Qe.rotation.set(-1.08+ie%3*.05,0,-re-Math.PI/2),Qe.userData.baseX=Qe.rotation.x,Qe.userData.phase=ie*.73,tt.push(Qe);let mn=ie<Math.round(x*1.5),It=E==="severe"&&mn?.76:1;for(let bt=0;bt<7;bt+=1){let $t=(bt-3)*.39,Qn=mn?ze:ie>10?Oe:ge,Yt=be(new Fs(ne,8),Qn),_t=(bt===3?.68:.52-Math.abs(bt-3)*.025)*It;Yt.scale.set(_t,_t,1),Yt.rotation.x=(bt%2?-.08:.06)+(100-I)*.0015,Yt.rotation.z=-$t,Yt.position.set(Math.sin($t)*.075,Math.cos($t)*.075,(bt-3)*.004),Qe.add(Yt);let Et=new k(-Math.sin($t)*_t*.04,Math.cos($t)*_t*.88,.006);if(Qe.add(W(new k(0,0,.006),Et,.006,We,5)),mn&&bt%2===0){let ei=be(new ri(.035,10),ce({color:8138002,side:Ot,roughness:1}));ei.position.set(Math.sin($t)*.08,.23+Math.cos($t)*.05,.012),Qe.add(ei)}}z.add(Qe)}Y&&(z.visible=!1,Ve.material.opacity=.16,P.material.transparent=!0,P.material.opacity=.1,He.scale.setScalar(1.25),He.position.y=.24),we.position.y=.05,we.rotation.x=-.06;let Se,he=!1,ue=0,Ae=0,Ie=()=>{let ie=X.getBoundingClientRect();H.setSize(Math.max(1,ie.width),Math.max(1,ie.height),!1),J.aspect=Math.max(1,ie.width)/Math.max(1,ie.height),J.updateProjectionMatrix()};Ie();let Ue=new ResizeObserver(Ie);Ue.observe(X);let B=ie=>{he=!0,ue=ie.clientX,X.setPointerCapture?.(ie.pointerId)},fe=ie=>{he&&(Ae+=(ie.clientX-ue)*.012,ue=ie.clientX)},te=()=>{he=!1},pe=ie=>{ie.preventDefault(),J.position.z=Math.max(5.2,Math.min(10,J.position.z+ie.deltaY*.006))};X.addEventListener("pointerdown",B),X.addEventListener("pointermove",fe),X.addEventListener("pointerup",te),X.addEventListener("pointercancel",te),X.addEventListener("wheel",pe,{passive:!1});let oe=new Ws,se=()=>{let ie=oe.getElapsedTime();he||(Ae+=.003),we.rotation.y=Ae,we.position.y=.05+Math.sin(ie*1.2)*.015,tt.forEach((re,Le)=>{re.rotation.x=re.userData.baseX+Math.sin(ie*1.35+re.userData.phase)*(.015+(100-I)*15e-5),re.rotation.y=Math.sin(ie*.9+Le)*.018}),H.render(U,J),Se=requestAnimationFrame(se)};return se(),()=>{cancelAnimationFrame(Se),Ue.disconnect(),X.removeEventListener("pointerdown",B),X.removeEventListener("pointermove",fe),X.removeEventListener("pointerup",te),X.removeEventListener("pointercancel",te),X.removeEventListener("wheel",pe),j.forEach(ie=>ie.dispose()),K.forEach(ie=>ie.dispose()),H.dispose()}},[y,M,x,E,R,I,N,O,A,D,L]),React.createElement("canvas",{ref:V,className:"plant-3d-canvas",tabIndex:"0","aria-label":"Interactive WebGL cassava model. Drag to rotate and scroll to zoom."})}function b({r:y,onRetake:M}){let{t:x,lang:E}=window.CG.Store.useStore(),R=y.top3[0];return React.createElement(n,{className:"animate-fadeup"},React.createElement(s,{icon:"grid",title:E==="th"?"\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E40\u0E0B\u0E19\u0E40\u0E0B\u0E2D\u0E23\u0E4C":"Sensor CSV Analysis",sub:`${y.rows} rows`}),React.createElement("div",{className:"flex items-center gap-4 mb-4"},React.createElement(u,{value:R.confidence*100,label:x("confidence")}),React.createElement("div",null,React.createElement(a,{tone:R.key,dot:!0},E==="th"?R.th:R.en),React.createElement("div",{className:"grid grid-cols-2 gap-2 mt-3 text-sm"},Object.entries(y.aggregates).map(([I,N])=>React.createElement("div",{key:I,className:"glass rounded-lg px-2.5 py-1.5"},React.createElement("div",{className:"txt-dim text-[10px] uppercase"},I.replace("_"," ")),React.createElement("div",{className:"txt font-semibold"},N)))))),React.createElement(f,{items:y.top3.map(I=>({key:I.key,label:E==="th"?I.th:I.en,value:I.confidence}))}),React.createElement("button",{onClick:M,className:"w-full mt-4 glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium"},React.createElement(r,{name:"history",className:"w-4 h-4"}),E==="th"?"\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48":"Retake"))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Predict=g})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Segmented:r,Spinner:o,Skeleton:l}=window.CG.UI,{LineChart:c}=window.CG.Charts,u=[{value:"ndvi",label:"NDVI"},{value:"ndwi",label:"NDMI"},{value:"savi",label:"SAVI"},{value:"evi",label:"EVI"}],p={ndvi:"NDVI",ndwi:"NDMI",savi:"SAVI",evi:"EVI"},f=(T,m)=>m==null?"#334155":T==="ndwi"?m>.2?"#0369a1":m>0?"#38bdf8":m>-.2?"#fcd34d":"#b45309":m>.6?"#065f46":m>.45?"#10b981":m>.3?"#fbbf24":"#dc2626";function h({initialField:T}){let{t:m,lang:d,toast:w}=window.CG.Store.useStore(),[C,_]=i([]),[b,y]=i(T||null),[M,x]=i("ndvi"),[E,R]=i(null),[I,N]=i(null),[O,A]=i(null),[D,L]=i(0),[V,X]=i(null);e(()=>{window.CG.API_CLIENT.fields().then(U=>{_(U),!b&&U.length&&y(U[0].id)})},[]),e(()=>{if(!b)return;R(null),N(null),X(null);let U=window.CG.API_CLIENT;U.satTimeline(b,12).then(J=>{R(J.series),L(J.series.length-1)}).catch(J=>w(J.message,"error")),U.satPasses(b).then(J=>N(J.passes)).catch(()=>{})},[b]),e(()=>{if(!b||!E)return;let U=E[D]?.date;window.CG.API_CLIENT.satGrid(b,M,U).then(A).catch(()=>{})},[b,M,D,E]),e(()=>{b&&window.CG.API_CLIENT.satCompare(b,M,"","").then(X).catch(()=>{})},[M,b]);let H=E?E[D]:null;return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement(g,{fields:C,fid:b,setFid:y}),React.createElement("div",{className:"flex items-center gap-2"},H?.data_source&&React.createElement(s,{tone:H.data_source.mode==="live"?"online":"medium",dot:!0},H.data_source.mode==="live"?d==="th"?"Sentinel-2 L2A \xB7 \u0E20\u0E32\u0E1E\u0E08\u0E23\u0E34\u0E07":"Sentinel-2 L2A \xB7 observed":d==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E25\u0E2D\u0E07":"Synthetic"),React.createElement(r,{options:u,value:M,onChange:x}))),React.createElement("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4"},["ndvi","ndwi","savi","evi"].map((U,J)=>React.createElement(t,{key:U,hover:!0,className:"animate-fadeup",style:{animationDelay:J*50+"ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},p[U]),React.createElement(a,{name:"satellite",className:"w-4 h-4 text-cyan2-light"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2 tabular-nums"},H?H[U]:React.createElement(l,{className:"h-7 w-16"})),React.createElement("div",{className:"h-1.5 rounded-full mt-2 overflow-hidden bg-white/5"},React.createElement("div",{className:"h-full rounded-full",style:{width:H?Math.min(100,Math.max(0,(H[U]+(U==="ndwi"?1:0))/(U==="ndwi"?2:1)*100))+"%":0,background:f(U,H?H[U]:0)}}))))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"grid",title:`${M.toUpperCase()} ${m("risk_zones")}`,sub:H?`${H.date} \xB7 valid ${H.valid_pct??100}%`:"",right:O&&React.createElement(s,{tone:"info"},"\u03BC ",O.mean)}),O?React.createElement(React.Fragment,null,React.createElement("div",{className:"grid gap-0.5 rounded-xl overflow-hidden",style:{gridTemplateColumns:`repeat(${O.grid_size},1fr)`}},O.cells.flat().map((U,J)=>React.createElement("div",{key:J,className:"aspect-square relative group",style:{background:f(M,U)},title:U===null?"nodata/cloud":U}))),React.createElement("div",{className:"flex items-center justify-between mt-2 text-[11px] txt-dim"},React.createElement("span",null,"low"),React.createElement("div",{className:"h-2 flex-1 mx-2 rounded-full",style:{background:"linear-gradient(90deg,#dc2626,#fbbf24,#10b981,#065f46)"}}),React.createElement("span",null,"high")),O.risk_zones.length>0&&React.createElement("div",{className:"mt-3 flex items-center gap-2 text-xs"},React.createElement(a,{name:"alert",className:"w-4 h-4 text-rose-400"}),React.createElement("span",{className:"txt-soft"},O.risk_zones.length," ",m("risk_zones")," \xB7 ",d==="th"?"\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E40\u0E0A\u0E34\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48":"spatial anomalies detected"))):React.createElement(l,{className:"h-48"}),E&&React.createElement("div",{className:"mt-4"},React.createElement("div",{className:"flex justify-between text-[11px] txt-dim mb-1"},React.createElement("span",null,m("time_slider")),React.createElement("span",{className:"txt-soft font-mono"},H?.date)),React.createElement("input",{type:"range",min:"0",max:E.length-1,value:D,onChange:U=>L(Number(U.target.value)),className:"w-full"}))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"satellite",title:m("trend"),sub:"12 months \xB7 all indices"}),E?React.createElement(c,{height:220,labels:E.map(U=>U.date.slice(2,7)),series:[{label:"NDVI",data:E.map(U=>U.ndvi),color:"#10b981"},{label:"NDMI",data:E.map(U=>U.ndwi),color:"#06b6d4"},{label:"SAVI",data:E.map(U=>U.savi),color:"#f59e0b"},{label:"EVI",data:E.map(U=>U.evi),color:"#8b5cf6"}],opts:{scales:{y:{min:-.5,max:1,grid:{color:"rgba(148,163,184,.12)"},ticks:{color:"#93a4bd",font:{size:9}}},x:{grid:{display:!1},ticks:{color:"#93a4bd",font:{size:9}}}}}}):React.createElement(l,{className:"h-52"}))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"grid",title:m("compare"),sub:V?`\u0394\u03BC ${V.delta_mean>0?"+":""}${V.delta_mean}`:""}),V?React.createElement("div",{className:"grid grid-cols-2 gap-3"},[["a",d==="th"?"\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32":"Earlier"],["b",d==="th"?"\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19":"Latest"]].map(([U,J])=>React.createElement("div",{key:U},React.createElement("div",{className:"flex justify-between text-xs mb-1.5"},React.createElement("span",{className:"txt-soft"},J),React.createElement("span",{className:"txt-dim font-mono"},V[U].date)),React.createElement("div",{className:"grid gap-px rounded-lg overflow-hidden",style:{gridTemplateColumns:`repeat(${V[U].grid_size},1fr)`}},V[U].cells.flat().map((Y,ae)=>React.createElement("div",{key:ae,className:"aspect-square",style:{background:f(M,Y)}}))),React.createElement("div",{className:"text-center txt-dim text-[11px] mt-1"},"\u03BC ",V[U].mean)))):React.createElement(l,{className:"h-40"})),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"satellite",title:m("sat_timeline"),sub:d==="th"?"\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E08\u0E23\u0E34\u0E07\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Actual recent acquisitions"}),I?React.createElement("div",{className:"space-y-2 max-h-64 overflow-y-auto no-scrollbar"},I.slice().reverse().map((U,J)=>React.createElement("div",{key:J,className:`flex items-center gap-3 rounded-xl px-3 py-2 ${U.future?"border border-dashed hair":"glass"}`},React.createElement("div",{className:`w-2 h-2 rounded-full shrink-0 ${U.usable?"bg-brand-400":"bg-amber-400"}`}),React.createElement("span",{className:"txt text-sm font-mono"},U.date),React.createElement("span",{className:"txt-soft text-xs"},U.satellite),React.createElement("div",{className:"flex-1"}),U.future?React.createElement(s,{tone:"info"},d==="th"?"\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E01\u0E32\u0E23":"scheduled"):React.createElement(s,{tone:U.usable?"low":"medium"},U.cloud_pct,"% cloud")))):React.createElement(l,{className:"h-40"}))))}function g({fields:T,fid:m,setFid:d}){let{lang:w}=window.CG.Store.useStore();return React.createElement("select",{value:m||"",onChange:C=>d(Number(C.target.value)),className:"glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},T.map(C=>React.createElement("option",{key:C.id,value:C.id,className:"bg-ink-800"},w==="th"&&C.name_th||C.name)))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Satellite=h,window.CG.FieldPicker=g})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r}=window.CG.UI,{LineChart:o,BarChart:l}=window.CG.Charts,c={sunny:"sun",partly_cloudy:"cloud",cloudy:"cloud",rain:"drop",storm:"drop"};function u({initialField:p}){let{t:f,lang:h,toast:g}=window.CG.Store.useStore(),[T,m]=i([]),[d,w]=i(p||null),[C,_]=i(null),[b,y]=i(null),[M,x]=i(null);e(()=>{window.CG.API_CLIENT.fields().then(R=>{m(R),!d&&R.length&&w(R[0].id)})},[]),e(()=>{let R=window.CG.API_CLIENT;_(null),y(null),x(null),R.weatherCurrent(d).then(_).catch(I=>g(I.message,"error")),R.weatherHistory(d,30).then(I=>y(I.series)).catch(()=>{}),R.weatherForecast(d,7).then(I=>x(I.series)).catch(()=>{})},[d]);let E=C?[{icon:"temp",label:h==="th"?"\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34":"Temperature",v:C.temp_c,u:"\xB0C",tone:"amber"},{icon:"drop",label:h==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E0A\u0E37\u0E49\u0E19":"Humidity",v:C.humidity_pct,u:"%",tone:"cyan"},{icon:"cloud",label:h==="th"?"\u0E1D\u0E19":"Rainfall",v:C.rainfall_mm,u:"mm",tone:"cyan"},{icon:"wind",label:h==="th"?"\u0E25\u0E21":"Wind",v:C.wind_kmh,u:"km/h",tone:"brand"},{icon:"sun",label:h==="th"?"\u0E23\u0E31\u0E07\u0E2A\u0E35\u0E14\u0E27\u0E07\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C":"Solar",v:C.solar_mj,u:"MJ",tone:"amber"}]:[];return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex items-center justify-between"},window.CG.FieldPicker&&React.createElement(window.CG.FieldPicker,{fields:T,fid:d,setFid:w}),React.createElement("div",{className:"flex items-center gap-2"},C?.data_source&&React.createElement(s,{tone:C.data_source.mode==="live"?"online":"medium",dot:!0},C.data_source.mode==="live"?h==="th"?"Open-Meteo \xB7 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E14":"Open-Meteo \xB7 live":h==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E25\u0E2D\u0E07":"Synthetic"),C&&React.createElement(s,{tone:"info"},h==="th"?C.condition_th:C.condition.replace("_"," ")))),React.createElement("div",{className:"grid lg:grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup relative overflow-hidden"},React.createElement("div",{className:"absolute -right-10 -top-10 w-40 h-40 rounded-full grad-brand opacity-10 blur-2xl"}),C?React.createElement("div",{className:"flex items-center gap-5"},React.createElement("div",{className:"w-20 h-20 rounded-3xl grad-brand grid place-items-center text-white animate-floaty"},React.createElement(a,{name:c[C.condition]||"cloud",className:"w-10 h-10"})),React.createElement("div",null,React.createElement("div",{className:"txt text-5xl font-bold tabular-nums"},C.temp_c,"\xB0"),React.createElement("div",{className:"txt-soft text-sm mt-1"},C.temp_min,"\xB0 / ",C.temp_max,"\xB0"))):React.createElement(r,{className:"h-20"})),React.createElement("div",{className:"lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3"},E.map((R,I)=>React.createElement(t,{key:I,hover:!0,className:"animate-fadeup",style:{animationDelay:I*40+"ms"}},React.createElement(a,{name:R.icon,className:"w-5 h-5 text-cyan2-light"}),React.createElement("div",{className:"txt text-xl font-bold mt-2 tabular-nums"},R.v,React.createElement("span",{className:"text-xs txt-soft ml-0.5"},R.u)),React.createElement("div",{className:"txt-dim text-[11px] mt-0.5"},R.label))))),React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"cloud",title:f("forecast")}),M?React.createElement("div",{className:"grid grid-cols-7 gap-2"},M.map((R,I)=>React.createElement("div",{key:I,className:"glass rounded-xl p-3 text-center card-hover"},React.createElement("div",{className:"txt-dim text-[11px]"},new Date(R.date).toLocaleDateString(h==="th"?"th-TH":"en",{weekday:"short"})),React.createElement(a,{name:c[R.condition]||"cloud",className:"w-6 h-6 mx-auto my-2 text-cyan2-light"}),React.createElement("div",{className:"txt font-bold text-sm"},R.temp_max,"\xB0"),React.createElement("div",{className:"txt-dim text-[11px]"},R.temp_min,"\xB0"),React.createElement("div",{className:"text-[11px] text-cyan2-light mt-1"},R.rainfall_mm,"mm")))):React.createElement(r,{className:"h-28"})),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"temp",title:`${f("trend")} \xB7 ${h==="th"?"\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34 & \u0E04\u0E27\u0E32\u0E21\u0E0A\u0E37\u0E49\u0E19":"Temp & Humidity"}`,sub:"30 days"}),b?React.createElement(o,{height:220,labels:b.map(R=>R.date.slice(5)),series:[{label:"Temp \xB0C",data:b.map(R=>R.temp_c),color:"#f59e0b"},{label:"Humidity %",data:b.map(R=>R.humidity_pct),color:"#06b6d4"}]}):React.createElement(r,{className:"h-52"})),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"cloud",title:`${f("trend")} \xB7 ${h==="th"?"\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E1D\u0E19":"Rainfall"}`,sub:"30 days"}),b?React.createElement(l,{height:220,labels:b.map(R=>R.date.slice(5)),series:[{label:"Rain mm",data:b.map(R=>R.rainfall_mm),color:"#06b6d4"}]}):React.createElement(r,{className:"h-52"}))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Weather=u})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r,Empty:o,Segmented:l}=window.CG.UI,c={nutrient:"soil",water:"drop",disease:"brain",weather:"cloud",info:"check"};function u({initialField:f}){let{t:h,lang:g,toast:T}=window.CG.Store.useStore(),[m,d]=i([]),[w,C]=i(f||"all"),[_,b]=i(null),[y,M]=i("all");e(()=>{window.CG.API_CLIENT.fields().then(d)},[]),e(()=>{b(null);let R=window.CG.API_CLIENT;(async()=>{try{if(w==="all"){let N=await R.fields(),O=await Promise.all(N.map(D=>R.field(D.id))),A=[];O.forEach(D=>D.recommendations.forEach(L=>A.push({...L,field:D.name,field_th:D.name_th,field_id:D.id}))),A.sort((D,L)=>({high:0,medium:1,info:2})[D.severity]-{high:0,medium:1,info:2}[L.severity]||L.confidence-D.confidence),b(A)}else{let N=await R.field(w);b(N.recommendations.map(O=>({...O,field:N.name,field_th:N.name_th,field_id:N.id})))}}catch(N){T(N.message,"error")}})()},[w]);let x=_?_.filter(R=>y==="all"||R.kind===y):null,E=_?{high:_.filter(R=>R.severity==="high").length,medium:_.filter(R=>R.severity==="medium").length,total:_.length}:{high:0,medium:0,total:0};return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement("select",{value:w,onChange:R=>C(R.target.value==="all"?"all":Number(R.target.value)),className:"glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"all",className:"bg-ink-800"},h("all_fields")),m.map(R=>React.createElement("option",{key:R.id,value:R.id,className:"bg-ink-800"},g==="th"&&R.name_th||R.name)))),React.createElement(l,{value:y,onChange:M,options:[{value:"all",label:g==="th"?"\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14":"All"},{value:"nutrient",label:g==="th"?"\u0E18\u0E32\u0E15\u0E38\u0E2D\u0E32\u0E2B\u0E32\u0E23":"Nutrient"},{value:"water",label:g==="th"?"\u0E19\u0E49\u0E33":"Water"},{value:"disease",label:g==="th"?"\u0E42\u0E23\u0E04":"Disease"}]})),React.createElement("div",{className:"grid grid-cols-3 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-rose-500/15 text-rose-300 grid place-items-center"},React.createElement(a,{name:"alert"})),React.createElement("div",null,React.createElement("div",{className:"txt text-2xl font-bold"},E.high),React.createElement("div",{className:"txt-dim text-xs"},h("high"))))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement("div",{className:"flex items-center gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 grid place-items-center"},React.createElement(a,{name:"bell"})),React.createElement("div",null,React.createElement("div",{className:"txt text-2xl font-bold"},E.medium),React.createElement("div",{className:"txt-dim text-xs"},h("medium"))))),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"120ms"}},React.createElement("div",{className:"flex items-center gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center"},React.createElement(a,{name:"bulb"})),React.createElement("div",null,React.createElement("div",{className:"txt text-2xl font-bold"},E.total),React.createElement("div",{className:"txt-dim text-xs"},h("recommendation")))))),x?x.length===0?React.createElement(t,null,React.createElement(o,{icon:"check",text:g==="th"?"\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E43\u0E19\u0E2B\u0E21\u0E27\u0E14\u0E19\u0E35\u0E49":"No recommendations in this category"})):React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},x.map((R,I)=>React.createElement(p,{key:I,r:R,delay:I*50}))):React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},[0,1,2,3].map(R=>React.createElement(t,{key:R},React.createElement(r,{className:"h-40"})))))}function p({r:f,delay:h}){let{lang:g}=window.CG.Store.useStore(),T=g==="th"?f.actions_th:f.actions_en;return React.createElement(t,{hover:!0,className:"animate-fadeup relative overflow-hidden",style:{animationDelay:h+"ms"}},React.createElement("div",{className:`absolute left-0 top-0 bottom-0 w-1 ${f.severity==="high"?"bg-rose-500":f.severity==="medium"?"bg-amber-500":"bg-brand-500"}`}),React.createElement("div",{className:"flex items-start justify-between gap-2 mb-3 pl-2"},React.createElement("div",{className:"flex items-center gap-2.5"},React.createElement("div",{className:`w-9 h-9 rounded-xl grid place-items-center ${f.severity==="high"?"bg-rose-500/15 text-rose-300":f.severity==="medium"?"bg-amber-500/15 text-amber-300":"bg-brand-500/15 text-brand-300"}`},React.createElement(a,{name:c[f.kind]||"bulb",className:"w-5 h-5"})),React.createElement("div",null,React.createElement("h4",{className:"txt font-semibold text-sm leading-tight"},g==="th"?f.title_th:f.title_en),f.field&&React.createElement("div",{className:"txt-dim text-[11px] mt-0.5"},g==="th"&&f.field_th||f.field))),React.createElement(s,{tone:f.severity},Math.round(f.confidence*100),"%")),React.createElement("div",{className:"pl-2"},React.createElement("div",{className:"txt-dim text-[11px] font-semibold uppercase mb-1.5"},g==="th"?"\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19":"Evidence"),React.createElement("ul",{className:"space-y-1 mb-3"},f.evidence.map((m,d)=>React.createElement("li",{key:d,className:"flex items-start gap-2 txt-soft text-xs"},React.createElement("span",{className:"w-1.5 h-1.5 rounded-full bg-cyan2 mt-1.5 shrink-0"}),g==="th"?m.th:m.en))),React.createElement("div",{className:"txt-dim text-[11px] font-semibold uppercase mb-1.5"},g==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33":"Actions"),React.createElement("ul",{className:"space-y-1"},T.map((m,d)=>React.createElement("li",{key:d,className:"flex items-start gap-2 txt text-xs"},React.createElement(a,{name:"check",className:"w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0"}),m))),React.createElement("div",{className:"mt-3 flex items-center gap-2"},React.createElement("div",{className:"flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden"},React.createElement("div",{className:"h-full grad-brand rounded-full",style:{width:f.confidence*100+"%",transition:"width 1s"}})),React.createElement("span",{className:"txt-dim text-[10px]"},g==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E31\u0E48\u0E19":"confidence"))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Recommendations=u})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r,Empty:o,Modal:l,ProgressRing:c}=window.CG.UI,{ProbBars:u}=window.CG.Charts;function p(){let{t:h,lang:g,toast:T}=window.CG.Store.useStore(),[m,d]=i(null),[w,C]=i(""),[_,b]=i(""),[y,M]=i(null),[x,E]=i([]),R=()=>{let L={};w&&(L.q=w),_&&(L.top_class=_),window.CG.API_CLIENT.history(L).then(V=>d(V.items)).catch(V=>T(V.message,"error"))};e(()=>{window.CG.API_CLIENT.classes().then(E)},[]),e(()=>{let L=setTimeout(R,250);return()=>clearTimeout(L)},[w,_]);let I=L=>window.CG.API_CLIENT.historyDetail(L).then(M).catch(V=>T(V.message,"error")),N=async L=>{let V=g==="th"?`\u0E25\u0E1A\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C #${L.id} \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E16\u0E32\u0E27\u0E23\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48?`:`Permanently delete prediction #${L.id} and its related images?`;if(window.confirm(V))try{await window.CG.API_CLIENT.deletePrediction(L.id),y?.id===L.id&&M(null),T(g==="th"?"\u0E25\u0E1A\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E41\u0E25\u0E49\u0E27":"Prediction deleted","success"),R()}catch(X){T(X.message,"error")}},O=L=>String(L??"").replace(/[&<>"']/g,V=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[V]),A=async()=>{try{let L=await window.CG.API_CLIENT.exportCsv();if(!L.ok)throw new Error("Export failed");let V=await L.blob(),X=URL.createObjectURL(V),H=document.createElement("a");H.href=X,H.download="cassavaguard_predictions.csv",H.click(),URL.revokeObjectURL(X)}catch(L){T(L.message,"error")}},D=()=>{if(!m||!m.length){T(h("no_data"),"warn");return}let L=window.open("","_blank"),V=m.map(X=>`<tr><td>${X.id}</td><td>${O(X.created_at.replace("T"," ").slice(0,16))}</td><td>${O(X.source)}</td><td>${O(X.top_class)}</td><td>${(X.confidence*100).toFixed(1)}%</td><td>${O(X.field_name||"-")}</td></tr>`).join("");L.document.write(`<html><head><title>CassavaGuard Prediction Report</title>
        <style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#0b1a2b}h1{color:#059669}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#ecfdf5}</style>
        </head><body><h1>\u{1F33F} CassavaGuard AI \u2014 Prediction Report</h1><p>Generated ${new Date().toLocaleString()} \xB7 ${m.length} records</p>
        <table><thead><tr><th>ID</th><th>Date</th><th>Source</th><th>Class</th><th>Confidence</th><th>Field</th></tr></thead><tbody>${V}</tbody></table>
        <script>setTimeout(()=>window.print(),400)<\/script></body></html>`),L.document.close()};return React.createElement("div",{className:"space-y-5"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"history",title:h("nav_history"),sub:m?`${m.length} records`:"",right:React.createElement("div",{className:"flex gap-2"},React.createElement("button",{onClick:A,className:"glass rounded-xl px-3 py-1.5 text-xs txt-soft hover:txt flex items-center gap-1.5"},React.createElement(a,{name:"download",className:"w-3.5 h-3.5"}),h("export_csv")),React.createElement("button",{onClick:D,className:"glass rounded-xl px-3 py-1.5 text-xs txt-soft hover:txt flex items-center gap-1.5"},React.createElement(a,{name:"download",className:"w-3.5 h-3.5"}),h("export_pdf")))}),React.createElement("div",{className:"flex flex-wrap gap-2 mb-4"},React.createElement("div",{className:"relative flex-1 min-w-[200px]"},React.createElement(a,{name:"search",className:"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 txt-dim"}),React.createElement("input",{value:w,onChange:L=>C(L.target.value),placeholder:h("search"),className:"w-full glass rounded-xl pl-9 pr-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"})),React.createElement("select",{value:_,onChange:L=>b(L.target.value),className:"glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40"},React.createElement("option",{value:"",className:"bg-ink-800"},h("all_fields")),x.map(L=>React.createElement("option",{key:L.key,value:L.key,className:"bg-ink-800"},g==="th"?L.th:L.en)))),m?m.length===0?React.createElement(o,{icon:"history",text:h("no_data")}):React.createElement("div",{className:"overflow-x-auto"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},["ID",g==="th"?"\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48":"Date",g==="th"?"\u0E41\u0E2B\u0E25\u0E48\u0E07":"Source",g==="th"?"\u0E1C\u0E25":"Result",h("confidence"),g==="th"?"\u0E41\u0E1B\u0E25\u0E07":"Field",""].map((L,V)=>React.createElement("th",{key:V,className:"text-left font-medium py-2 px-2"},L)))),React.createElement("tbody",null,m.map(L=>{let V=x.find(X=>X.key===L.top_class)||{th:L.top_class,en:L.top_class};return React.createElement("tr",{key:L.id,className:"border-b hair hover:bg-white/[.02] transition"},React.createElement("td",{className:"py-2.5 px-2 txt-dim font-mono text-xs"},"#",L.id),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-xs"},L.created_at.replace("T"," ").slice(0,16)),React.createElement("td",{className:"py-2.5 px-2"},React.createElement("span",{className:"txt-soft text-xs capitalize"},L.source)),React.createElement("td",{className:"py-2.5 px-2"},React.createElement(s,{tone:L.top_class||"slate"},g==="th"?V.th:V.en)),React.createElement("td",{className:"py-2.5 px-2 txt font-mono text-xs tabular-nums"},(L.confidence*100).toFixed(1),"%"),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-xs"},L.field_name||"\u2014"),React.createElement("td",{className:"py-2.5 px-2"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement("button",{onClick:()=>I(L.id),title:g==="th"?"\u0E14\u0E39\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14":"View details",className:"txt-soft hover:text-brand-400"},React.createElement(a,{name:"chevron",className:"w-4 h-4"})),React.createElement("button",{onClick:()=>N(L),title:g==="th"?"\u0E25\u0E1A\u0E1C\u0E25\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E":"Delete result and images",className:"txt-dim hover:text-rose-400"},React.createElement(a,{name:"close",className:"w-4 h-4"})))))})))):React.createElement(r,{className:"h-64"})),React.createElement(l,{open:!!y,onClose:()=>M(null),title:y?`Prediction #${y.id}`:"",wide:!0},y&&React.createElement(f,{d:y,classes:x})))}function f({d:h,classes:g}){let{lang:T,t:m}=window.CG.Store.useStore(),{useState:d}=React,[w,C]=d(!0),_=g.find(b=>b.key===h.top_class)||{th:h.top_class,en:h.top_class};return React.createElement("div",{className:"grid md:grid-cols-2 gap-5"},React.createElement("div",null,(h.image_url||h.heatmap_url)&&React.createElement("div",{className:"relative rounded-xl overflow-hidden bg-black/20 grid place-items-center min-h-[180px] mb-3"},React.createElement("img",{src:w&&h.heatmap_url?h.heatmap_url:h.image_url,alt:"prediction",className:"w-full object-contain max-h-[220px]"}),h.image_url&&h.heatmap_url&&React.createElement("div",{className:"absolute bottom-2 right-2 flex gap-1"},React.createElement("button",{onClick:()=>C(!1),className:`text-[11px] px-2 py-1 rounded-lg ${w?"glass-strong txt-soft":"grad-brand text-white"}`},"Original"),React.createElement("button",{onClick:()=>C(!0),className:`text-[11px] px-2 py-1 rounded-lg ${w?"grad-brand text-white":"glass-strong txt-soft"}`},T==="th"?"\u0E08\u0E38\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D":"Attribution"))),React.createElement("div",{className:"flex items-center gap-4 mb-4"},React.createElement(c,{value:h.confidence*100,label:m("confidence")}),React.createElement("div",null,React.createElement(s,{tone:h.top_class||"slate",dot:!0},T==="th"?_.th:_.en),React.createElement("div",{className:"txt-dim text-xs mt-2 font-mono"},h.model_id),React.createElement("div",{className:"txt-dim text-xs"},h.inference_ms," ms \xB7 ",h.source))),h.symptoms&&h.symptoms.length>0&&React.createElement("div",{className:"mb-3"},React.createElement("div",{className:"txt-dim text-xs font-semibold uppercase mb-1.5"},m("symptoms")),h.symptoms.map((b,y)=>React.createElement("div",{key:y,className:"txt-soft text-xs flex items-center gap-2 mb-1"},React.createElement("span",{className:"w-1.5 h-1.5 rounded-full bg-cyan2"}),T==="th"?b.th:b.en))),React.createElement("div",{className:"glass rounded-xl p-3"},React.createElement("div",{className:"txt-dim text-xs font-semibold mb-1"},m("explain")),React.createElement("p",{className:"txt-soft text-xs leading-relaxed"},T==="th"?h.explanation_th:h.explanation))),React.createElement("div",null,React.createElement("div",{className:"txt-dim text-xs font-semibold uppercase mb-2"},m("prob_dist")),h.probs&&React.createElement(u,{items:Object.entries(h.probs).map(([b,y])=>{let M=g.find(x=>x.key===b)||{th:b,en:b};return{key:b,label:T==="th"?M.th:M.en,value:y}}).sort((b,y)=>y.value-b.value),height:220}),h.feature_importance&&h.feature_importance.length>0&&React.createElement("div",{className:"mt-3 space-y-2"},h.feature_importance.map((b,y)=>React.createElement("div",{key:y},React.createElement("div",{className:"flex justify-between text-[11px] mb-1"},React.createElement("span",{className:"txt-soft"},b.feature),React.createElement("span",{className:"txt-dim"},(b.importance*100).toFixed(0),"%")),React.createElement("div",{className:"h-1.5 bg-white/5 rounded-full overflow-hidden"},React.createElement("div",{className:"h-full grad-brand rounded-full",style:{width:b.importance*100+"%"}})))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.History=p})();(function(){let{useState:i,useEffect:e}=React,{Card:t,SectionTitle:n,Badge:s,Icon:a,Skeleton:r}=window.CG.UI,{RadarChart:o,BarChart:l}=window.CG.Charts;function c(){let{t:u,lang:p,toast:f,user:h}=window.CG.Store.useStore(),[g,T]=i(null),[m,d]=i(null),[w,C]=i(null),[_,b]=i(null),[y,M]=i(null),x=A=>A==null?"\u2014":`${(A*100).toFixed(1)}%`,E=new Set(["healthy","cbb","cbsd","cmd","cgm"]),R=["#10b981","#06b6d4","#f59e0b","#8b5cf6","#f43f5e","#14b8a6","#84cc16","#3b82f6","#e879f9","#fb7185"],I=A=>({serving_trained_model:p==="th"?"\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07":"serving",serving_trained_auxiliary_model:p==="th"?"\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07 \xB7 \u0E2B\u0E31\u0E27\u0E40\u0E2A\u0E23\u0E34\u0E21":"serving \xB7 auxiliary",serving_experimental_auxiliary_model:p==="th"?"\u0E17\u0E14\u0E25\u0E2D\u0E07\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33":"experimental \xB7 review required",serving_experimental_detector:p==="th"?"\u0E15\u0E31\u0E27\u0E15\u0E23\u0E27\u0E08\u0E08\u0E31\u0E1A\u0E17\u0E14\u0E25\u0E2D\u0E07 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33":"experimental detector \xB7 review required",dataset_available_training_required:p==="th"?"\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \xB7 \u0E23\u0E2D\u0E1D\u0E36\u0E01":"data ready \xB7 train pending",real_dataset_downloaded_training_required:p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E1E\u0E23\u0E49\u0E2D\u0E21 \xB7 \u0E23\u0E2D\u0E1D\u0E36\u0E01":"real data ready \xB7 train pending",real_dataset_downloaded_detector_training_required:p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E23\u0E2D\u0E1A\u0E27\u0E31\u0E15\u0E16\u0E38\u0E1E\u0E23\u0E49\u0E2D\u0E21 \xB7 \u0E23\u0E2D\u0E1D\u0E36\u0E01":"boxed data ready \xB7 detector pending",real_data_insufficient_synthetic_seed:p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E22\u0E31\u0E07\u0E19\u0E49\u0E2D\u0E22 \xB7 \u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19":"real data insufficient \xB7 synthetic seed",synthetic_seed_real_data_required:p==="th"?"\u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E2B\u0E32\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07":"synthetic seed \xB7 real data required",synthetic_seed_real_paired_data_required:p==="th"?"\u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E01\u0E47\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E08\u0E31\u0E1A\u0E04\u0E39\u0E48":"synthetic seed \xB7 paired real data required",blocked_missing_labeled_images:p==="th"?"\u0E02\u0E32\u0E14\u0E20\u0E32\u0E1E\u0E15\u0E34\u0E14\u0E1B\u0E49\u0E32\u0E22":"blocked \xB7 missing labelled images",blocked_missing_paired_labels:p==="th"?"\u0E02\u0E32\u0E14\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E31\u0E1A\u0E04\u0E39\u0E48":"blocked \xB7 missing paired labels"})[A]||A,N=A=>A.startsWith("serving_trained_")?"online":["serving_experimental_auxiliary_model","serving_experimental_detector"].includes(A)||A.includes("dataset_downloaded")||A==="dataset_available_training_required"?"medium":"slate";e(()=>{let A=window.CG.API_CLIENT;A.models().then(T).catch(L=>f(L.message,"error")),A.modelCompare().then(d).catch(()=>{}),A.systemStatus().then(C).catch(()=>{}),h.role==="admin"&&(A.logs().then(b).catch(()=>b([])),A.adminUsers().then(M).catch(()=>M([])));let D=setInterval(()=>A.systemStatus().then(C).catch(()=>{}),5e3);return()=>clearInterval(D)},[]);let O=async(A,D)=>{try{await window.CG.API_CLIENT.updateUserRole(A,D),M(await window.CG.API_CLIENT.adminUsers()),f(p==="th"?"\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E1A\u0E17\u0E1A\u0E32\u0E17\u0E41\u0E25\u0E49\u0E27":"Role updated","success")}catch(L){f(L.message,"error")}};return React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"grid md:grid-cols-4 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},u("server_status")),React.createElement("span",{className:"w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2"},w?"Online":React.createElement(r,{className:"h-7 w-20"})),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},w?`uptime ${Math.floor(w.server.uptime_s/60)}m \xB7 load ${w.server.load_1m}`:"")),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"50ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},"Compute"),React.createElement(a,{name:"cpu",className:"w-4 h-4 text-cyan2-light"})),React.createElement("div",{className:"txt text-lg font-bold mt-2"},w?w.gpu.device:React.createElement(r,{className:"h-6 w-24"})),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},w?w.gpu.backend:"")),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"100ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},"Inference"),React.createElement(a,{name:"brain",className:"w-4 h-4 text-brand-400"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2 tabular-nums"},w&&w.inference.avg_ms!=null?w.inference.avg_ms:"\u2014",w&&w.inference.avg_ms!=null&&React.createElement("span",{className:"text-sm txt-soft"},"ms")),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},w&&w.inference.throughput_img_s!=null?`${w.inference.throughput_img_s} img/s`:p==="th"?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07":"No samples yet")),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"150ms"}},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"txt-soft text-xs font-semibold"},"Dataset"),React.createElement(a,{name:"grid",className:"w-4 h-4 text-violet-400"})),React.createElement("div",{className:"txt text-2xl font-bold mt-2 tabular-nums"},w?(w.dataset.train+w.dataset.val+w.dataset.test).toLocaleString():"\u2013"),React.createElement("div",{className:"txt-dim text-[11px] mt-1"},w?p==="th"?`${w.dataset.classes} \u0E04\u0E25\u0E32\u0E2A\u0E17\u0E35\u0E48\u0E40\u0E17\u0E23\u0E19 \xB7 ${w.dataset.reference_only_classes||0} \u0E04\u0E25\u0E32\u0E2A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07`:`${w.dataset.classes} trained \xB7 ${w.dataset.reference_only_classes||0} reference-only`:""),w&&!w.dataset.field_validated&&React.createElement("div",{className:"text-amber-300 text-[10px] mt-1"},p==="th"?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2D\u0E34\u0E2A\u0E23\u0E30\u0E01\u0E31\u0E1A\u0E20\u0E32\u0E1E\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E17\u0E22":"Not independently validated on Thai field photos"))),React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"cpu",title:p==="th"?"\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E42\u0E21\u0E40\u0E14\u0E25":"Model Registry",right:g&&React.createElement(s,{tone:"brand"},"active \xB7 ",g.active)}),g?React.createElement("div",{className:"overflow-x-auto"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},["Model","Version","Accuracy","F1 / mAP50","Params","Size","Speed",""].map((A,D)=>React.createElement("th",{key:D,className:"text-left font-medium py-2 px-2"},A)))),React.createElement("tbody",null,g.models.filter(A=>!A.experimental&&!/brown|white/i.test(A.id)).map(A=>React.createElement("tr",{key:A.id,className:"border-b hair hover:bg-white/[.02]"},React.createElement("td",{className:"py-2.5 px-2 txt font-medium text-xs"},A.name),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},A.version),React.createElement("td",{className:"py-2.5 px-2 txt font-mono text-xs"},x(A.accuracy)),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},A.map50!=null?`mAP50 ${x(A.map50)}`:x(A.f1)),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},A.params_m!=null?A.params_m+"M":"\u2014"),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},A.size_mb!=null?A.size_mb+"MB":"\u2014"),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-xs"},A.avg_inference_ms!=null?A.avg_inference_ms+"ms":"\u2014"),React.createElement("td",{className:"py-2.5 px-2"},A.experimental?React.createElement(s,{tone:"medium"},A.runtime_enabled?p==="th"?"\u0E17\u0E14\u0E25\u0E2D\u0E07 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33":"experimental \xB7 review only":p==="th"?"\u0E17\u0E14\u0E25\u0E2D\u0E07 \xB7 \u0E1B\u0E34\u0E14":"experimental \xB7 off"):A.active?React.createElement(s,{tone:"online",dot:!0},"active"):React.createElement(s,{tone:"slate"},"standby"))))))):React.createElement(r,{className:"h-32"})),g?.class_readiness&&React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"check",title:p==="th"?"\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E02\u0E2D\u0E07\u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01\u0E17\u0E31\u0E49\u0E07 5":"Readiness of five primary classes",sub:p==="th"?"\u0E42\u0E23\u0E04 \xB7 \u0E41\u0E21\u0E25\u0E07 \xB7 \u0E20\u0E32\u0E27\u0E30\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14 \u0E43\u0E0A\u0E49\u0E2B\u0E31\u0E27\u0E42\u0E21\u0E40\u0E14\u0E25\u0E04\u0E19\u0E25\u0E30\u0E0A\u0E19\u0E34\u0E14 \u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E04\u0E30\u0E41\u0E19\u0E19\u0E1B\u0E25\u0E2D\u0E21":"Diseases, pests and stresses use separate model heads; no fabricated probabilities",right:React.createElement(s,{tone:"info"},"5/5 ",p==="th"?"\u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01":"primary classes")}),React.createElement("div",{className:"overflow-x-auto max-h-[460px]"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E04\u0E25\u0E32\u0E2A":"Class"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E07\u0E32\u0E19\u0E42\u0E21\u0E40\u0E14\u0E25":"Model task"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E2A\u0E16\u0E32\u0E19\u0E30":"Status"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25/\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25":"Data / reason"))),React.createElement("tbody",null,g.class_readiness.filter(A=>E.has(A.key)).map(A=>React.createElement("tr",{key:A.key,className:"border-b hair align-top"},React.createElement("td",{className:"py-2.5 px-2"},React.createElement("div",{className:"txt text-xs font-medium"},p==="th"?A.th:A.en),React.createElement("div",{className:"txt-dim font-mono text-[10px] mt-0.5"},A.key)),React.createElement("td",{className:"py-2.5 px-2 txt-soft font-mono text-[11px]"},A.task),React.createElement("td",{className:"py-2.5 px-2"},React.createElement(s,{tone:N(A.status),dot:A.production_output},I(A.status))),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-[11px] max-w-md"},React.createElement("div",null,A.reason),A.dataset?.name&&React.createElement("div",{className:"txt-dim mt-1"},A.dataset.name," \xB7 ",A.dataset.license,A.dataset.images?` \xB7 ${A.dataset.images.toLocaleString()} images`:""),A.synthetic?.images>0&&React.createElement("div",{className:"text-amber-300/80 mt-1"},p==="th"?`\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C ${A.synthetic.images} \u0E20\u0E32\u0E1E \xB7 train-only \xB7 \u0E2B\u0E49\u0E32\u0E21\u0E43\u0E0A\u0E49\u0E27\u0E31\u0E14\u0E1C\u0E25`:`${A.synthetic.images} synthetic \xB7 train-only \xB7 excluded from evaluation`)))))))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"brain",title:u("model_cmp"),sub:"accuracy \xB7 F1 \xB7 precision \xB7 recall"}),m?React.createElement(o,{height:280,labels:["Accuracy","F1","Precision","Recall"],series:m.models.map((A,D)=>({label:A.name.split(" ").slice(-1)[0],data:[A.accuracy,A.f1,A.precision,A.recall].map(L=>L==null?null:Math.round(L*100)),color:R[D%R.length]}))}):React.createElement(r,{className:"h-64"})),React.createElement(t,{className:"animate-fadeup",style:{animationDelay:"60ms"}},React.createElement(n,{icon:"cpu",title:p==="th"?"\u0E02\u0E19\u0E32\u0E14 vs \u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27":"Size vs Speed",sub:"MB \xB7 inference ms"}),m?React.createElement(l,{height:280,labels:m.models.map(A=>A.name.split(" ").slice(-1)[0]),series:[{label:"Size MB",data:m.models.map(A=>A.size_mb),color:"#8b5cf6"},{label:"Speed ms",data:m.models.map(A=>A.avg_inference_ms),color:"#06b6d4"}]}):React.createElement(r,{className:"h-64"}))),h.role==="admin"&&React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"check",title:p==="th"?"\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E41\u0E25\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C":"Users & roles",sub:p==="th"?"\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E43\u0E2B\u0E21\u0E48\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23":"New accounts start as Farmer"}),y?React.createElement("div",{className:"overflow-x-auto"},React.createElement("table",{className:"w-full text-sm"},React.createElement("thead",null,React.createElement("tr",{className:"txt-dim text-xs border-b hair"},React.createElement("th",{className:"text-left font-medium py-2 px-2"},"Email"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E0A\u0E37\u0E48\u0E2D":"Name"),React.createElement("th",{className:"text-left font-medium py-2 px-2"},p==="th"?"\u0E1A\u0E17\u0E1A\u0E32\u0E17":"Role"))),React.createElement("tbody",null,y.map(A=>React.createElement("tr",{key:A.id,className:"border-b hair"},React.createElement("td",{className:"py-2.5 px-2 txt font-mono text-xs"},A.email),React.createElement("td",{className:"py-2.5 px-2 txt-soft text-xs"},A.full_name||"\u2014"),React.createElement("td",{className:"py-2.5 px-2"},React.createElement("select",{value:A.role,onChange:D=>O(A.id,D.target.value),className:"glass rounded-lg px-2 py-1 txt text-xs bg-transparent"},React.createElement("option",{value:"farmer",className:"bg-ink-800"},"Farmer"),React.createElement("option",{value:"researcher",className:"bg-ink-800"},"Researcher"),React.createElement("option",{value:"admin",className:"bg-ink-800"},"Admin")))))))):React.createElement(r,{className:"h-24"})),h.role==="admin"&&React.createElement(t,{className:"animate-fadeup"},React.createElement(n,{icon:"history",title:u("training_logs"),sub:p==="th"?"\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E33\u0E02\u0E2D API \u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Recent API requests"}),_?React.createElement("div",{className:"font-mono text-[11px] space-y-1 max-h-64 overflow-y-auto no-scrollbar"},_.slice(0,40).map(A=>React.createElement("div",{key:A.id,className:"flex items-center gap-2 txt-soft"},React.createElement("span",{className:"txt-dim"},A.at.slice(11,19)),React.createElement("span",{className:`w-12 ${A.status<300?"text-brand-400":A.status<400?"text-amber-400":"text-rose-400"}`},A.status),React.createElement("span",{className:"w-14 txt-dim"},A.method),React.createElement("span",{className:"flex-1 truncate"},A.path),React.createElement("span",{className:"txt-dim tabular-nums"},A.ms,"ms")))):React.createElement(r,{className:"h-32"})))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.System=c})();(function(){let{Card:i,SectionTitle:e,Badge:t,Icon:n}=window.CG.UI,s={th:[["\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E41\u0E1B\u0E25\u0E07","\u0E44\u0E1B\u0E17\u0E35\u0E48 \u201C\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07\u201D \u0E01\u0E14 \u201C\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07\u201D \u0E41\u0E25\u0E49\u0E27\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D \u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14 \u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C \u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48 \u0E41\u0E25\u0E30\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07"],["\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E43\u0E2B\u0E49\u0E0A\u0E31\u0E14","\u0E43\u0E0A\u0E49\u0E41\u0E2A\u0E07\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34 \u0E20\u0E32\u0E1E\u0E44\u0E21\u0E48\u0E2A\u0E31\u0E48\u0E19 \u0E40\u0E2B\u0E47\u0E19\u0E43\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E49\u0E19\u0E40\u0E15\u0E47\u0E21\u0E2A\u0E48\u0E27\u0E19\u0E17\u0E35\u0E48\u0E21\u0E35\u0E2D\u0E32\u0E01\u0E32\u0E23 \u0E41\u0E25\u0E30\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E23\u0E01"],["\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI","\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E JPG/PNG \u0E41\u0E25\u0E49\u0E27\u0E01\u0E14 \u201C\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u201D \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E33\u0E41\u0E19\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30 5 \u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01"],["\u0E15\u0E23\u0E27\u0E08\u0E1C\u0E25\u0E01\u0E48\u0E2D\u0E19\u0E25\u0E07\u0E21\u0E37\u0E2D","\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08\u0E41\u0E25\u0E30\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E08\u0E23\u0E34\u0E07\u0E01\u0E48\u0E2D\u0E19\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23"],["\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E1C\u0E25","\u0E14\u0E39\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34 \u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33 \u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E41\u0E25\u0E30\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E19 \u0E44\u0E21\u0E48\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E40\u0E14\u0E35\u0E22\u0E27"]],en:[["Create a field","Open Field Map, choose Add field, then enter the real name, province, variety, area and coordinates."],["Capture a clear photo","Use daylight, avoid blur, show the affected leaf or plant clearly and keep the background simple."],["Run AI analysis","Choose a field, upload JPG/PNG, then analyze one of the five primary classes."],["Review before acting","Check confidence and review reasons against the plant before taking action."],["Monitor over time","Use History, Recommendations, Satellite and Weather together instead of relying on one photo."]]},a={th:[["\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07","\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E25\u0E30\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E14\u0E39\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15 \u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 \u0E41\u0E25\u0E30\u0E0A\u0E31\u0E49\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 NDVI/NDMI/SAVI"],["\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI","\u0E08\u0E33\u0E41\u0E19\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30 Healthy, CBB, CBSD, CMD \u0E41\u0E25\u0E30 CGM"],["\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E41\u0E25\u0E30\u0E2D\u0E32\u0E01\u0E32\u0E28","\u0E43\u0E0A\u0E49 Sentinel-2 \u0E41\u0E25\u0E30 Open-Meteo \u0E41\u0E1A\u0E1A live \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E17\u0E35\u0E48\u0E21\u0E32\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32"],["\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34","\u0E23\u0E27\u0E21\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E2B\u0E25\u0E32\u0E22\u0E41\u0E2B\u0E25\u0E48\u0E07 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E1C\u0E25 \u0E41\u0E25\u0E30\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 CSV/PDF"],["\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E30\u0E42\u0E21\u0E40\u0E14\u0E25","\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E1C\u0E25\u0E27\u0E31\u0E14\u0E42\u0E21\u0E40\u0E14\u0E25\u0E2B\u0E25\u0E31\u0E01 5 \u0E04\u0E25\u0E32\u0E2A"]],en:[["Field Map","Create and select fields; inspect boundaries, risk and NDVI/NDMI/SAVI layers."],["AI Diagnosis","Restricted to Healthy, CBB, CBSD, CMD and CGM."],["Satellite and weather","Live Sentinel-2 and Open-Meteo data with provider and timestamp provenance."],["Recommendations and history","Combines evidence, records results and exports CSV/PDF."],["System and models","Inspect server health and measured metrics for the five primary classes."]]};function r(){let{lang:o}=window.CG.Store.useStore(),l=s[o]||s.en,c=a[o]||a.en,u=o==="th";return React.createElement("div",{className:"space-y-5"},React.createElement(i,{className:"animate-fadeup overflow-hidden relative"},React.createElement("div",{className:"absolute -right-20 -top-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl"}),React.createElement(e,{icon:"book",title:u?"\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 CassavaGuard AI":"Getting started with CassavaGuard AI",sub:u?"\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21\u0E08\u0E23\u0E34\u0E07":"Recommended workflow for real field data",right:React.createElement(t,{tone:"medium"},u?"\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08":"decision support")}),React.createElement("p",{className:"txt-soft text-sm leading-relaxed relative"},u?"\u0E1C\u0E25 AI \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E1C\u0E25\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E32\u0E01\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23 \u0E2B\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E2A\u0E14\u0E07 \u201C\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33\u201D \u0E43\u0E2B\u0E49\u0E15\u0E23\u0E27\u0E08\u0E15\u0E49\u0E19\u0E08\u0E23\u0E34\u0E07 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E36\u0E01\u0E29\u0E32\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E16\u0E2D\u0E19\u0E15\u0E49\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35":"AI output is not a laboratory confirmation. When review is required, inspect the plant, compare multiple photos and consult an expert before roguing plants or applying chemicals.")),React.createElement(i,{className:"animate-fadeup border border-brand-500/20"},React.createElement(e,{icon:"play",title:u?"\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E41\u0E1A\u0E1A\u0E40\u0E23\u0E47\u0E27\u0E43\u0E19 3 \u0E19\u0E32\u0E17\u0E35":"Three-minute quick start"}),React.createElement("div",{className:"grid md:grid-cols-3 gap-3 text-sm"},(u?[["1","\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1B\u0E25\u0E07","\u0E40\u0E1B\u0E34\u0E14 \u201C\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07\u201D \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E30\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E15\u0E23\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48"],["2","\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E","\u0E40\u0E1B\u0E34\u0E14 \u201C\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E14\u0E49\u0E27\u0E22 AI\u201D \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E30\u0E0A\u0E19\u0E34\u0E14\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E49\u0E27\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E JPG/PNG \u0E17\u0E35\u0E48\u0E0A\u0E31\u0E14\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 10 MB"],["3","\u0E2D\u0E48\u0E32\u0E19\u0E41\u0E25\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E1C\u0E25","\u0E14\u0E39 Confidence \u0E41\u0E25\u0E30\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E49\u0E27\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E1C\u0E25\u0E44\u0E27\u0E49\u0E43\u0E19\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34"]]:[["1","Add a field","Open Field Map and enter the real field name and coordinates so weather and satellite data match the site."],["2","Upload a photo","Open AI Diagnosis, choose the field and image type, then use a clear JPG/PNG up to 10 MB."],["3","Review and verify","Read confidence and review status, compare multiple photos, then retain the result in History."]]).map(([p,f,h])=>React.createElement("div",{key:p,className:"rounded-xl border hair p-3"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement(t,{tone:"medium"},p),React.createElement("span",{className:"txt font-semibold"},f)),React.createElement("p",{className:"txt-soft text-xs leading-relaxed mt-2"},h)))),React.createElement("p",{className:"txt-muted text-xs mt-3"},u?"\u0E2B\u0E32\u0E01\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E1A\u0E19 Render Free \u0E2B\u0E25\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 \u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E32\u0E08\u0E43\u0E0A\u0E49\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E19\u0E32\u0E17\u0E35\u0E43\u0E19\u0E01\u0E32\u0E23\u0E40\u0E23\u0E34\u0E48\u0E21\u0E17\u0E33\u0E07\u0E32\u0E19\u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E23\u0E01 \u0E43\u0E2B\u0E49\u0E23\u0E2D\u0E41\u0E25\u0E49\u0E27\u0E23\u0E35\u0E40\u0E1F\u0E23\u0E0A\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07":"On Render Free, the first request after inactivity can take about a minute. Wait and refresh once.")),React.createElement("div",{className:"grid md:grid-cols-2 xl:grid-cols-3 gap-4"},l.map(([p,f],h)=>React.createElement(i,{key:p,className:"animate-fadeup",style:{animationDelay:`${h*45}ms`}},React.createElement("div",{className:"flex items-start gap-3"},React.createElement("div",{className:"w-9 h-9 rounded-xl grad-brand text-white grid place-items-center font-bold shrink-0"},h+1),React.createElement("div",null,React.createElement("h3",{className:"txt font-semibold text-sm"},p),React.createElement("p",{className:"txt-soft text-xs leading-relaxed mt-1"},f)))))),React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"grid",title:u?"\u0E41\u0E15\u0E48\u0E25\u0E30\u0E40\u0E21\u0E19\u0E39\u0E43\u0E0A\u0E49\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23":"What each area does"}),React.createElement("div",{className:"grid md:grid-cols-2 gap-x-6 gap-y-4"},c.map(([p,f])=>React.createElement("div",{key:p,className:"flex gap-3"},React.createElement(n,{name:"check",className:"w-4 h-4 text-brand-400 shrink-0 mt-0.5"}),React.createElement("div",null,React.createElement("div",{className:"txt text-sm font-medium"},p),React.createElement("div",{className:"txt-soft text-xs leading-relaxed mt-0.5"},f)))))),React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"activity",title:u?"\u0E04\u0E27\u0E32\u0E21\u0E2B\u0E21\u0E32\u0E22\u0E02\u0E2D\u0E07\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C":"Understanding result status"}),React.createElement("div",{className:"grid md:grid-cols-2 gap-3 text-xs leading-relaxed"},React.createElement("div",{className:"rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3"},React.createElement("div",{className:"font-semibold text-emerald-300"},u?"\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19":"Ready"),React.createElement("div",{className:"txt-soft mt-1"},u?"\u0E42\u0E21\u0E40\u0E14\u0E25\u0E42\u0E2B\u0E25\u0E14\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E41\u0E25\u0E30\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1C\u0E25\u0E44\u0E14\u0E49 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E08\u0E23\u0E34\u0E07\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07":"The model loaded and can produce results, which must still be checked against the field.")),React.createElement("div",{className:"rounded-xl border border-amber-500/25 bg-amber-500/10 p-3"},React.createElement("div",{className:"font-semibold text-amber-300"},u?"\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E0B\u0E49\u0E33 / Review only":"Review required / Review only"),React.createElement("div",{className:"txt-soft mt-1"},u?"\u0E1C\u0E25\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E44\u0E21\u0E48\u0E41\u0E19\u0E48\u0E19\u0E2D\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E42\u0E21\u0E40\u0E14\u0E25\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21 \u0E2B\u0E49\u0E32\u0E21\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E40\u0E14\u0E35\u0E22\u0E27\u0E43\u0E19\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35":"The result is uncertain or not field-validated; never use it alone to justify chemical treatment.")),React.createElement("div",{className:"rounded-xl border border-slate-500/25 bg-slate-500/10 p-3"},React.createElement("div",{className:"font-semibold txt"},u?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A":"Unsupported"),React.createElement("div",{className:"txt-soft mt-1"},u?"\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E15\u0E34\u0E14\u0E1B\u0E49\u0E32\u0E22\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E04\u0E33\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E02\u0E2D\u0E07\u0E04\u0E25\u0E32\u0E2A\u0E19\u0E31\u0E49\u0E19":"There is not enough labelled evidence, so the app does not invent a diagnosis for that class.")),React.createElement("div",{className:"rounded-xl border border-rose-500/25 bg-rose-500/10 p-3"},React.createElement("div",{className:"font-semibold text-rose-300"},u?"\u0E42\u0E21\u0E40\u0E14\u0E25\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21 / \u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E02\u0E31\u0E14\u0E02\u0E49\u0E2D\u0E07":"Model unavailable / Service error"),React.createElement("div",{className:"txt-soft mt-1"},u?"\u0E2D\u0E22\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E1C\u0E25\u0E40\u0E14\u0E34\u0E21\u0E41\u0E17\u0E19 \u0E43\u0E2B\u0E49\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48 \u0E40\u0E1B\u0E34\u0E14 \u201C\u0E23\u0E30\u0E1A\u0E1A & \u0E42\u0E21\u0E40\u0E14\u0E25\u201D \u0E41\u0E25\u0E30\u0E41\u0E08\u0E49\u0E07\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E2B\u0E32\u0E01\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21":"Do not substitute an old result. Retry, inspect System & Models, and notify the administrator if it persists.")))),React.createElement("div",{className:"grid lg:grid-cols-2 gap-4"},React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"camera",title:u?"\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A AI":"Photos suitable for AI"}),React.createElement("ul",{className:"space-y-2 txt-soft text-sm"},(u?["\u0E16\u0E48\u0E32\u0E22\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E38\u0E21: \u0E43\u0E1A\u0E14\u0E49\u0E32\u0E19\u0E2B\u0E19\u0E49\u0E32 \u0E43\u0E15\u0E49\u0E43\u0E1A \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E17\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E01\u0E23\u0E30\u0E08\u0E32\u0E22","\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E08\u0E32\u0E01\u0E2D\u0E34\u0E19\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E40\u0E19\u0E47\u0E15 \u0E20\u0E32\u0E1E\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D \u0E2B\u0E23\u0E37\u0E2D\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E1F\u0E34\u0E25\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2A\u0E35","Whitefly: \u0E43\u0E2B\u0E49\u0E15\u0E31\u0E27\u0E41\u0E21\u0E25\u0E07\u0E21\u0E35\u0E02\u0E19\u0E32\u0E14\u0E21\u0E2D\u0E07\u0E40\u0E2B\u0E47\u0E19\u0E44\u0E14\u0E49\u0E41\u0E25\u0E30\u0E2D\u0E22\u0E48\u0E32\u0E25\u0E14\u0E04\u0E27\u0E32\u0E21\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E01\u0E48\u0E2D\u0E19\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14","\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E43\u0E1A\u0E40\u0E1B\u0E35\u0E22\u0E01 \u0E41\u0E2A\u0E07\u0E22\u0E49\u0E2D\u0E19 \u0E41\u0E25\u0E30\u0E40\u0E07\u0E32\u0E21\u0E37\u0E2D\u0E1A\u0E31\u0E07\u0E2D\u0E32\u0E01\u0E32\u0E23"]:["Capture multiple views: leaf front, underside and whole plant for distributed symptoms.","Do not upload internet images, screenshots or color-filtered photos.","Whitefly: insects must be visible; do not downscale before upload.","Avoid wet leaves, backlighting and hand shadows over symptoms."]).map(p=>React.createElement("li",{key:p,className:"flex gap-2"},React.createElement("span",{className:"text-brand-400"},"\u2022"),React.createElement("span",null,p))))),React.createElement(i,{className:"animate-fadeup"},React.createElement(e,{icon:"alert",title:u?"\u0E02\u0E49\u0E2D\u0E08\u0E33\u0E01\u0E31\u0E14\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E23\u0E39\u0E49":"Important limitations"}),React.createElement("div",{className:"space-y-3 text-xs leading-relaxed"},React.createElement("div",{className:"rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-200"},u?"White Leaf Spot \u0E41\u0E25\u0E30 Whitefly \u0E40\u0E1B\u0E47\u0E19\u0E42\u0E21\u0E40\u0E14\u0E25\u0E17\u0E14\u0E25\u0E2D\u0E07\u0E41\u0E1A\u0E1A review-only \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E0A\u0E38\u0E14\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E17\u0E22\u0E2D\u0E34\u0E2A\u0E23\u0E30":"White Leaf Spot and Whitefly are review-only experimental models without an independent Thai-field holdout."),React.createElement("div",{className:"rounded-xl border hair p-3 txt-soft"},u?"CAD, SED, Mealybug, Water Stress \u0E41\u0E25\u0E30 Nutrient Deficiency \u0E22\u0E31\u0E07\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E15\u0E34\u0E14\u0E1B\u0E49\u0E32\u0E22\u0E44\u0E21\u0E48\u0E1E\u0E2D \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1C\u0E25\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E41\u0E1A\u0E1A\u0E1B\u0E25\u0E2D\u0E21":"CAD, SED, Mealybug, Water Stress and Nutrient Deficiency lack sufficient labelled data, so the app does not fabricate image diagnoses."),React.createElement("div",{className:"rounded-xl border hair p-3 txt-soft"},u?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E40\u0E1B\u0E47\u0E19\u0E1C\u0E25\u0E41\u0E1A\u0E1A\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23 \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E2D\u0E32\u0E08\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32\u0E08\u0E32\u0E01\u0E40\u0E21\u0E06\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19":"Weather is provider model output, and satellite imagery can be delayed by cloud cover or revisit timing.")))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Guide=r})();(function(){let{Card:i,Icon:e,Badge:t}=window.CG.UI;function n(){let{lang:s}=window.CG.Store.useStore(),a=s==="th";return React.createElement("div",{className:"space-y-5 max-w-5xl mx-auto pb-10"},React.createElement(i,{className:"animate-fadeup bg-gradient-to-br from-brand-500/10 to-cyan2/5"},React.createElement(t,{tone:"info"},a?"\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14 9 \u0E2A\u0E34\u0E07\u0E2B\u0E32\u0E04\u0E21 2569":"Last updated 9 August 2026"),React.createElement("h2",{className:"txt text-2xl sm:text-3xl font-black mt-4"},a?"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27 \u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D":"Privacy, terms and contact"),React.createElement("p",{className:"txt-soft text-sm leading-relaxed mt-2"},a?"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E17\u0E35\u0E48\u0E04\u0E27\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E20\u0E32\u0E1E\u0E2B\u0E23\u0E37\u0E2D\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07":"Important information to read before uploading photos or recording field data.")),React.createElement("div",{className:"grid md:grid-cols-2 gap-4"},(a?[["privacy","\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27","\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07 \u0E1E\u0E34\u0E01\u0E31\u0E14 \u0E20\u0E32\u0E1E\u0E1E\u0E37\u0E0A \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E15\u0E32\u0E21\u0E17\u0E35\u0E48\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E23\u0E49\u0E2D\u0E07\u0E02\u0E2D \u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E43\u0E1A\u0E2B\u0E19\u0E49\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 \u0E1B\u0E49\u0E32\u0E22\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19 \u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07"],["database","\u0E01\u0E32\u0E23\u0E40\u0E01\u0E47\u0E1A\u0E41\u0E25\u0E30\u0E25\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25","\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E41\u0E25\u0E30 metadata \u0E16\u0E39\u0E01\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E43\u0E19\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \u0E2A\u0E48\u0E27\u0E19\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E08\u0E16\u0E39\u0E01\u0E40\u0E01\u0E47\u0E1A\u0E43\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E44\u0E1F\u0E25\u0E4C \u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E25\u0E1A\u0E1C\u0E25\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E40\u0E21\u0E19\u0E39\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34 \u0E01\u0E32\u0E23\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E08\u0E04\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E15\u0E32\u0E21\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23"],["users","\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E43\u0E19\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E0A\u0E31\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19","\u0E23\u0E30\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A Login \u0E1C\u0E39\u0E49\u0E17\u0E35\u0E48\u0E21\u0E35 URL \u0E2D\u0E32\u0E08\u0E40\u0E2B\u0E47\u0E19\u0E41\u0E25\u0E30\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E0A\u0E38\u0E14\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19 \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E04\u0E27\u0E23\u0E43\u0E2A\u0E48\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E25\u0E31\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E08\u0E19\u0E01\u0E27\u0E48\u0E32\u0E08\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E23\u0E30\u0E1A\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49"],["alert","\u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49 AI","\u0E1C\u0E25 AI \u0E40\u0E1B\u0E47\u0E19\u0E01\u0E32\u0E23\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E32\u0E01\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23 \u0E2B\u0E49\u0E32\u0E21\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E40\u0E14\u0E35\u0E22\u0E27\u0E43\u0E19\u0E01\u0E32\u0E23\u0E16\u0E2D\u0E19\u0E15\u0E49\u0E19 \u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35 \u0E2B\u0E23\u0E37\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E2D\u0E32\u0E08\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22"],["cloud","\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E20\u0E32\u0E22\u0E19\u0E2D\u0E01","\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E21\u0E32\u0E08\u0E32\u0E01 Open-Meteo \u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21\u0E21\u0E32\u0E08\u0E32\u0E01 Sentinel-2/Earth Search \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E08\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32 \u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E0A\u0E31\u0E48\u0E27\u0E04\u0E23\u0E32\u0E27"],["mail","\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25","\u0E2B\u0E32\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E1B\u0E31\u0E0D\u0E2B\u0E32 \u0E02\u0E2D\u0E41\u0E01\u0E49\u0E44\u0E02 \u0E2B\u0E23\u0E37\u0E2D\u0E25\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21 \u0E42\u0E1B\u0E23\u0E14\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E1C\u0E48\u0E32\u0E19 Repository: github.com/norapolamarit-commits/cassavaguard-render"]]:[["privacy","Privacy","The service processes field details, coordinates, crop photos, measured soil results and prediction history to provide requested features. Do not upload faces, documents, licence plates or unrelated personal data."],["database","Storage and deletion","Predictions and metadata are stored in the database, while images may be stored as files. Delete a result and its related images from History. Backups may remain according to the provider backup cycle."],["users","Current access model","Login is not required. Anyone with the URL may access the same shared dataset, so do not enter confidential or personal information until user accounts are enabled."],["alert","AI terms","AI results are screening support, not laboratory confirmation. Never use them as the sole basis for roguing, chemical treatment or other potentially harmful action."],["cloud","External services","Weather is provided by Open-Meteo and satellite observations by Sentinel-2/Earth Search. Data can be delayed, incomplete or temporarily unavailable."],["mail","Contact","To report a problem or request further correction or deletion, contact the administrator through github.com/norapolamarit-commits/cassavaguard-render."]]).map(([o,l,c])=>React.createElement(i,{key:l,className:"animate-fadeup"},React.createElement("div",{className:"flex items-start gap-3"},React.createElement("div",{className:"w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center shrink-0"},React.createElement(e,{name:o})),React.createElement("div",null,React.createElement("h3",{className:"txt font-bold"},l),React.createElement("p",{className:"txt-soft text-sm leading-relaxed mt-2"},c)))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Legal=n})();(function(){let{Card:i,Badge:e,Icon:t}=window.CG.UI;function n({go:s}){let{lang:a}=window.CG.Store.useStore(),r=a==="th";return React.createElement("div",{className:"space-y-6 pb-10"},React.createElement("section",{className:"relative overflow-hidden rounded-[2rem] border hair min-h-[470px] glass animate-fadeup"},React.createElement("div",{className:"absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-cyan2/10"}),React.createElement("div",{className:"absolute -top-28 -right-16 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl"}),React.createElement("div",{className:"absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan2/15 blur-3xl"}),React.createElement("div",{className:"absolute right-[8%] top-[14%] hidden lg:grid w-60 h-60 rounded-full border border-brand-400/20 place-items-center"},React.createElement("div",{className:"absolute inset-5 rounded-full border border-cyan2/20 animate-spin",style:{animationDuration:"18s"}}),React.createElement("div",{className:"w-32 h-32 rounded-[2.5rem] grad-brand grid place-items-center text-white shadow-2xl shadow-brand-500/40 rotate-6"},React.createElement(t,{name:"leaf",className:"w-16 h-16 -rotate-6"})),React.createElement("span",{className:"absolute -left-8 top-9 glass rounded-2xl px-3 py-2 text-xs txt-soft"},"AI + Field data"),React.createElement("span",{className:"absolute -right-10 bottom-8 glass rounded-2xl px-3 py-2 text-xs text-brand-300"},r?"5 \u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01":"5 primary classes")),React.createElement("div",{className:"relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20 max-w-3xl"},React.createElement(e,{tone:"online",dot:!0},r?"\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C \xB7 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19":"System online \xB7 Ready to begin"),React.createElement("h2",{className:"txt text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mt-6"},r?"\u0E14\u0E39\u0E41\u0E25\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07":"Protect cassava",React.createElement("br",null),React.createElement("span",{className:"grad-text"},r?"\u0E14\u0E49\u0E27\u0E22\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30 AI":"with data and AI")),React.createElement("p",{className:"txt-soft text-base sm:text-lg leading-relaxed mt-5 max-w-2xl"},r?"CassavaGuard \u0E23\u0E27\u0E21\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E08\u0E32\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E41\u0E25\u0E30\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E1E\u0E37\u0E0A\u0E43\u0E19\u0E17\u0E35\u0E48\u0E40\u0E14\u0E35\u0E22\u0E27":"CassavaGuard combines field photos, weather, terrain and satellite evidence to screen risks and monitor crop health in one place."),React.createElement("div",{className:"flex flex-col sm:flex-row gap-3 mt-8"},React.createElement("button",{onClick:()=>s("predict"),className:"grad-brand text-white rounded-2xl px-6 py-3.5 font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 hover:scale-[1.02] active:scale-[.98] transition"},React.createElement(t,{name:"brain",className:"w-5 h-5"}),r?"\u0E40\u0E23\u0E34\u0E48\u0E21\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E":"Start image analysis"),React.createElement("button",{onClick:()=>s("guide"),className:"glass rounded-2xl px-6 py-3.5 txt font-semibold flex items-center justify-center gap-2 hover:bg-white/[.07] transition"},React.createElement(t,{name:"book",className:"w-5 h-5 text-brand-300"}),r?"\u0E14\u0E39\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19":"Open user guide")),React.createElement("button",{onClick:()=>s("dashboard"),className:"txt-dim hover:txt text-sm mt-5 inline-flex items-center gap-2 transition"},r?"\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21":"Or open the overview dashboard"," ",React.createElement("span",{"aria-hidden":"true"},"\u2192")))),React.createElement("section",{className:"grid md:grid-cols-3 gap-4"},(r?[["brain","\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E\u0E14\u0E49\u0E27\u0E22 AI","\u0E08\u0E33\u0E41\u0E19\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30 5 \u0E04\u0E25\u0E32\u0E2A\u0E2B\u0E25\u0E31\u0E01\u0E17\u0E35\u0E48\u0E21\u0E35\u0E42\u0E21\u0E40\u0E14\u0E25\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A"],["satellite","\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E1A\u0E1A\u0E23\u0E2D\u0E1A\u0E14\u0E49\u0E32\u0E19","\u0E14\u0E39\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E20\u0E32\u0E1E\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E1A\u0E1C\u0E25\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E"],["book","\u0E21\u0E35\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E17\u0E38\u0E01\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19","\u0E41\u0E19\u0E30\u0E19\u0E33\u0E01\u0E32\u0E23\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E2D\u0E48\u0E32\u0E19 Confidence \u0E41\u0E25\u0E30\u0E15\u0E23\u0E27\u0E08\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E1C\u0E25\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08"]]:[["brain","AI image diagnosis","Diagnosis is restricted to the five model-backed primary classes."],["satellite","Whole-field context","Review weather, terrain, satellite and history alongside image evidence."],["book","Guidance at every step","Learn photo capture, confidence interpretation and field verification before acting."]]).map(([l,c,u],p)=>React.createElement(i,{key:c,hover:!0,className:"animate-fadeup relative overflow-hidden",style:{animationDelay:`${p*70}ms`}},React.createElement("div",{className:"w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-cyan2/10 text-brand-300 grid place-items-center"},React.createElement(t,{name:l})),React.createElement("h3",{className:"txt font-bold mt-4"},c),React.createElement("p",{className:"txt-soft text-sm leading-relaxed mt-2"},u)))),React.createElement("section",null,React.createElement(i,{className:"animate-fadeup"},React.createElement("h3",{className:"txt font-bold text-lg"},r?"\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E01\u0E31\u0E1A CassavaGuard":"About CassavaGuard"),React.createElement("div",{className:"txt-soft text-sm leading-relaxed mt-3 space-y-3"},r?React.createElement(React.Fragment,null,React.createElement("p",null,"CassavaGuard \u0E40\u0E1B\u0E47\u0E19\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E1A\u0E19\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E21\u0E37\u0E2D\u0E16\u0E37\u0E2D\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E1B\u0E31\u0E0D\u0E0D\u0E32\u0E1B\u0E23\u0E30\u0E14\u0E34\u0E29\u0E10\u0E4C (AI) \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E1C\u0E39\u0E49\u0E1B\u0E25\u0E39\u0E01\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07\u0E43\u0E19\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E0A\u0E41\u0E25\u0E30\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07\u0E42\u0E23\u0E04\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19 \u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E02\u0E36\u0E49\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E01\u0E49\u0E44\u0E02\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07 \u0E40\u0E0A\u0E48\u0E19 \u0E01\u0E32\u0E23\u0E23\u0E30\u0E1A\u0E32\u0E14\u0E02\u0E2D\u0E07\u0E42\u0E23\u0E04 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E1E\u0E36\u0E48\u0E07\u0E1E\u0E32\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E07\u0E40\u0E01\u0E15\u0E14\u0E49\u0E27\u0E22\u0E2A\u0E32\u0E22\u0E15\u0E32\u0E02\u0E2D\u0E07\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27 \u0E0B\u0E36\u0E48\u0E07\u0E2D\u0E32\u0E08\u0E17\u0E33\u0E43\u0E2B\u0E49\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E1E\u0E37\u0E0A\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33"),React.createElement("p",null,"\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E20\u0E32\u0E1E\u0E43\u0E1A\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E1A\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28 \u0E20\u0E39\u0E21\u0E34\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 \u0E41\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38\u0E2A\u0E20\u0E32\u0E1E\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E0A\u0E43\u0E19\u0E01\u0E25\u0E38\u0E48\u0E21\u0E42\u0E23\u0E04\u0E2B\u0E25\u0E31\u0E01 \u0E44\u0E14\u0E49\u0E41\u0E01\u0E48 Healthy, CBB, CBSD, CMD \u0E41\u0E25\u0E30 CGM \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E41\u0E2A\u0E14\u0E07\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E21\u0E31\u0E48\u0E19\u0E43\u0E08 \u0E04\u0E27\u0E32\u0E21\u0E23\u0E38\u0E19\u0E41\u0E23\u0E07 Heatmap \u0E41\u0E25\u0E30\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E17\u0E35\u0E48\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E41\u0E1B\u0E25\u0E07"),React.createElement("p",null,"\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E19\u0E35\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E43\u0E2B\u0E49\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E23\u0E27\u0E14\u0E40\u0E23\u0E47\u0E27 \u0E2A\u0E30\u0E14\u0E27\u0E01 \u0E41\u0E25\u0E30\u0E43\u0E0A\u0E49\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E01\u0E32\u0E23\u0E40\u0E01\u0E29\u0E15\u0E23\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33 \u0E25\u0E14\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E0D\u0E40\u0E2A\u0E35\u0E22\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A\u0E42\u0E23\u0E04\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32 \u0E41\u0E25\u0E30\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E41\u0E1B\u0E25\u0E07\u0E44\u0E14\u0E49\u0E17\u0E31\u0E19\u0E17\u0E48\u0E27\u0E07\u0E17\u0E35\u0E21\u0E32\u0E01\u0E02\u0E36\u0E49\u0E19 \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E20\u0E32\u0E27\u0E30\u0E02\u0E32\u0E14\u0E18\u0E32\u0E15\u0E38\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E34\u0E28\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E15\u0E48\u0E2D\u0E44\u0E1B\u0E02\u0E2D\u0E07\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23 \u0E0B\u0E36\u0E48\u0E07\u0E08\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1D\u0E36\u0E01\u0E42\u0E21\u0E40\u0E14\u0E25\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E48\u0E32\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E16\u0E37\u0E2D"),React.createElement("p",null,"\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E31\u0E49\u0E19\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E19\u0E33\u0E44\u0E1B\u0E43\u0E0A\u0E49\u0E43\u0E19\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E40\u0E01\u0E29\u0E15\u0E23\u0E42\u0E14\u0E22\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 \u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E36\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E1C\u0E25\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E41\u0E17\u0E19\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E44\u0E14\u0E49")):React.createElement(React.Fragment,null,React.createElement("p",null,"CassavaGuard is a mobile application that uses artificial intelligence (AI) to help cassava farmers monitor plant health and screen for disease early. The project was built to address problems in cassava production such as disease outbreaks and reliance on visual inspection alone, which can delay or reduce the accuracy of crop management decisions."),React.createElement("p",null,"The application analyzes cassava leaf photos with weather, terrain and satellite evidence to identify the primary classes \u2014 Healthy, CBB, CBSD, CMD and CGM \u2014 and provides confidence, severity, a heatmap and field-grounded guidance."),React.createElement("p",null,"The application gives farmers fast, convenient information to support decision-making, enabling precision agriculture, reducing losses from delayed disease detection, and allowing more timely field management. Nutrient-deficiency assessment and yield forecasting are future directions for the project, to be enabled once enough real data exists to train those models reliably."),React.createElement("p",null,"The system is currently at the stage of an early screening assistant and still requires formal field validation before its output can be used to automate agricultural decisions. Results from the system are decision-support information, not a confirmed diagnosis that replaces an expert."))))),React.createElement("section",{className:"grid lg:grid-cols-[1.2fr_.8fr] gap-4"},React.createElement(i,{className:"animate-fadeup"},React.createElement("div",{className:"flex flex-col sm:flex-row sm:items-center gap-4"},React.createElement("div",{className:"w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 grid place-items-center shrink-0"},React.createElement(t,{name:"alert"})),React.createElement("div",{className:"flex-1"},React.createElement("h3",{className:"txt font-semibold"},r?"AI \u0E0A\u0E48\u0E27\u0E22\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E1C\u0E25\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E32\u0E01\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23":"AI screening is not laboratory confirmation"),React.createElement("p",{className:"txt-soft text-xs leading-relaxed mt-1"},r?"\u0E15\u0E23\u0E27\u0E08\u0E15\u0E49\u0E19\u0E08\u0E23\u0E34\u0E07 \u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E36\u0E01\u0E29\u0E32\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E16\u0E2D\u0E19\u0E15\u0E49\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35":"Inspect plants, compare multiple photos and consult an expert before roguing or chemical treatment.")),React.createElement("button",{onClick:()=>s("system"),className:"rounded-xl border hair px-4 py-2 txt-soft hover:txt text-xs font-semibold transition"},r?"\u0E14\u0E39\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E42\u0E21\u0E40\u0E14\u0E25":"Model status"))),React.createElement(i,{className:"animate-fadeup bg-gradient-to-br from-brand-500/10 to-cyan2/5"},React.createElement("div",{className:"flex items-center justify-between gap-4 h-full"},React.createElement("div",null,React.createElement("div",{className:"txt-dim text-xs"},r?"\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E23\u0E01":"Recommended first step"),React.createElement("div",{className:"txt font-bold mt-1"},r?"\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E41\u0E1B\u0E25\u0E07\u0E14\u0E49\u0E27\u0E22\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E08\u0E23\u0E34\u0E07":"Create a field with real coordinates")),React.createElement("button",{onClick:()=>s("map"),className:"w-11 h-11 rounded-xl grad-brand text-white grid place-items-center hover:scale-105 transition"},React.createElement(t,{name:"map"}))))))}window.CG.Pages=window.CG.Pages||{},window.CG.Pages.Welcome=n})();(function(){let{useState:i,useEffect:e,useCallback:t}=React,{Icon:n,ToastHost:s,Modal:a,Spinner:r}=window.CG.UI,o=window.CG.Pages,l=[{key:"predict",icon:"camera",th:"\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",en:"Analyze"},{key:"history",icon:"history",th:"\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34",en:"History"},{key:"recommendations",icon:"bulb",th:"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",en:"Advice"},{key:"weather",icon:"cloud",th:"\u0E2D\u0E32\u0E01\u0E32\u0E28",en:"Weather"}],c=[{key:"map",icon:"map",th:"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07",en:"Field map"},{key:"satellite",icon:"satellite",th:"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Satellite"},{key:"dashboard",icon:"grid",th:"\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",en:"Overview"},{key:"system",icon:"cpu",th:"\u0E2A\u0E16\u0E32\u0E19\u0E30 AI",en:"AI status"},{key:"guide",icon:"book",th:"\u0E27\u0E34\u0E18\u0E35\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",en:"How to use"},{key:"legal",icon:"privacy",th:"\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27",en:"Privacy"}];function u(){let{lang:g,theme:T,toggleTheme:m,toggleLang:d,user:w,booted:C}=window.CG.Store.useStore(),[_,b]=i("predict"),[y,M]=i(null),[x,E]=i(!1),R=D=>g==="th"?D.th:D.en,I=t((D,L=null)=>{b(D),M(L),E(!1),window.scrollTo({top:0,behavior:"smooth"})},[]);if(e(()=>{w&&window.CG.API_CLIENT.classes().then(D=>{window.CG._classMap={},D.forEach(L=>{window.CG._classMap[L.key]=L})}).catch(()=>{})},[w]),!C)return React.createElement("div",{className:"min-h-screen theme-bg grid place-items-center"},React.createElement("div",{className:"brand-orbit"},React.createElement(n,{name:"leaf",className:"w-7 h-7"})));if(!w)return React.createElement("div",{className:"min-h-screen theme-bg grid place-items-center px-6 text-center"},React.createElement("div",null,React.createElement("div",{className:"txt text-xl font-bold"},"CassavaGuard AI"),React.createElement("p",{className:"txt-soft mt-2"},g==="th"?"\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D API \u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E27\u0E48\u0E32 backend \u0E01\u0E33\u0E25\u0E31\u0E07\u0E17\u0E33\u0E07\u0E32\u0E19":"Unable to connect to the API. Check that the backend is running.")));let N=()=>{switch(_){case"predict":return React.createElement(o.Predict,null);case"history":return React.createElement(o.History,null);case"recommendations":return React.createElement(o.Recommendations,{initialField:y});case"weather":return React.createElement(o.Weather,{initialField:y});case"map":return React.createElement(o.FieldMap,{go:I});case"satellite":return React.createElement(o.Satellite,{initialField:y});case"dashboard":return React.createElement(o.Dashboard,{go:I});case"system":return React.createElement(o.System,null);case"guide":return React.createElement(o.Guide,null);case"legal":return React.createElement(o.Legal,null);default:return React.createElement(o.Predict,null)}},O=[...l,...c].find(D=>D.key===_),A={history:{th:"\u0E22\u0E49\u0E2D\u0E19\u0E14\u0E39\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E41\u0E25\u0E30\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07",en:"Review analyses and track changes over time"},recommendations:{th:"\u0E41\u0E19\u0E27\u0E17\u0E32\u0E07\u0E14\u0E39\u0E41\u0E25\u0E17\u0E35\u0E48\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E01\u0E31\u0E1A\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14",en:"Care guidance linked to your latest results"},weather:{th:"\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E08\u0E23\u0E34\u0E07\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07",en:"Live weather context for field planning"},map:{th:"\u0E14\u0E39\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E41\u0E25\u0E30\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E02\u0E2D\u0E07\u0E41\u0E15\u0E48\u0E25\u0E30\u0E41\u0E1B\u0E25\u0E07",en:"View the location and status of every field"},satellite:{th:"\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E04\u0E27\u0E32\u0E21\u0E40\u0E02\u0E35\u0E22\u0E27\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E08\u0E32\u0E01\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21",en:"Track vegetation and change from satellite data"},dashboard:{th:"\u0E2A\u0E23\u0E38\u0E1B\u0E2A\u0E34\u0E48\u0E07\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E08\u0E32\u0E01\u0E17\u0E38\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E14\u0E35\u0E22\u0E27",en:"The important signals across all fields"},system:{th:"\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E42\u0E21\u0E40\u0E14\u0E25 \u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E \u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E02\u0E2D\u0E07\u0E23\u0E30\u0E1A\u0E1A",en:"Model quality, evidence, and system readiness"},guide:{th:"\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E41\u0E25\u0E30\u0E2D\u0E48\u0E32\u0E19\u0E1C\u0E25\u0E43\u0E2B\u0E49\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07",en:"Capture better photos and understand results"},legal:{th:"\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \u0E02\u0E49\u0E2D\u0E08\u0E33\u0E01\u0E31\u0E14 \u0E41\u0E25\u0E30\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D",en:"Data use, limitations, and contact information"}};return React.createElement("div",{className:"min-h-screen theme-bg pb-24 md:pb-0"},React.createElement("a",{href:"#main-content",className:"skip-link"},g==="th"?"\u0E02\u0E49\u0E32\u0E21\u0E44\u0E1B\u0E22\u0E31\u0E07\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E2B\u0E25\u0E31\u0E01":"Skip to main content"),React.createElement("header",{className:"sticky top-0 z-[800] app-header"},React.createElement("div",{className:"max-w-7xl mx-auto h-[72px] px-4 sm:px-6 flex items-center gap-4"},React.createElement("button",{onClick:()=>I("predict"),className:"flex items-center gap-3 shrink-0","aria-label":"CassavaGuard"},React.createElement("span",{className:"brand-mark"},React.createElement(n,{name:"leaf",className:"w-6 h-6"})),React.createElement("span",{className:"hidden sm:block text-left"},React.createElement("span",{className:"txt block font-extrabold text-base leading-none"},"CassavaGuard"),React.createElement("span",{className:"brand-copy block mt-1"},"AI \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E21\u0E31\u0E19\u0E2A\u0E33\u0E1B\u0E30\u0E2B\u0E25\u0E31\u0E07"))),React.createElement("nav",{className:"hidden md:flex items-center justify-center gap-1 ml-auto","aria-label":g==="th"?"\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E25\u0E31\u0E01":"Main navigation"},l.map(D=>React.createElement(p,{key:D.key,item:D,active:_===D.key,text:R(D),onClick:()=>I(D.key)})),React.createElement("button",{onClick:()=>E(!0),className:"nav-pill txt-soft"},React.createElement(n,{name:"grid",className:"w-4 h-4"}),g==="th"?"\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21":"More")),React.createElement("div",{className:"flex items-center gap-2 md:ml-3 ml-auto"},React.createElement("button",{onClick:d,className:"utility-button","aria-label":g==="th"?"\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E29\u0E32\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29":"Switch to Thai"},g==="th"?"EN":"\u0E44\u0E17\u0E22"),React.createElement("button",{onClick:m,className:"utility-button square","aria-label":g==="th"?"\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E18\u0E35\u0E21":"Change theme"},React.createElement(n,{name:T==="dark"?"sun":"moon",className:"w-4 h-4"})),React.createElement("button",{onClick:()=>E(!0),className:"utility-button square md:hidden","aria-label":g==="th"?"\u0E40\u0E1B\u0E34\u0E14\u0E40\u0E21\u0E19\u0E39":"Open menu"},React.createElement(n,{name:"menu",className:"w-5 h-5"}))))),_!=="predict"&&React.createElement("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 pt-7"},React.createElement("div",{className:"route-heading"},React.createElement("span",{className:"page-icon"},React.createElement(n,{name:O?.icon||"leaf",className:"w-5 h-5"})),React.createElement("div",null,React.createElement("h1",{className:"txt text-2xl sm:text-3xl font-extrabold"},O?R(O):"CassavaGuard"),A[_]&&React.createElement("p",{className:"txt-soft text-sm mt-1"},g==="th"?A[_].th:A[_].en)))),React.createElement("main",{id:"main-content",tabIndex:"-1",className:"max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-7"},React.createElement("div",{key:_,className:"page-enter"},N())),React.createElement("nav",{className:"mobile-dock md:hidden","aria-label":g==="th"?"\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E25\u0E31\u0E01":"Main navigation"},l.slice(0,3).map(D=>React.createElement(f,{key:D.key,item:D,active:_===D.key,text:R(D),onClick:()=>I(D.key)})),React.createElement(f,{item:{icon:"menu"},active:c.some(D=>D.key===_)||_==="weather",text:g==="th"?"\u0E40\u0E21\u0E19\u0E39":"Menu",onClick:()=>E(!0)})),React.createElement(a,{open:x,onClose:()=>E(!1),title:g==="th"?"\u0E40\u0E21\u0E19\u0E39\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14":"All features"},React.createElement("div",{className:"grid grid-cols-2 gap-3"},[...l,...c].map(D=>React.createElement("button",{key:D.key,onClick:()=>I(D.key),className:`menu-tile ${_===D.key?"active":""}`},React.createElement("span",{className:"menu-tile-icon"},React.createElement(n,{name:D.icon,className:"w-5 h-5"})),React.createElement("span",null,R(D)))))),React.createElement(h,{lang:g}),React.createElement(s,null))}function p({item:g,active:T,text:m,onClick:d}){return React.createElement("button",{onClick:d,className:`nav-pill ${T?"active":"txt-soft"}`},React.createElement(n,{name:g.icon,className:"w-4 h-4"}),m)}function f({item:g,active:T,text:m,onClick:d}){return React.createElement("button",{onClick:d,className:`dock-item ${T?"active":""}`},React.createElement(n,{name:g.icon,className:"w-5 h-5"}),React.createElement("span",null,m))}function h({lang:g}){let[T,m]=i(!1),[d,w]=i(""),[C,_]=i(!1),b=React.useRef(null),[y,M]=i([{role:"assistant",text:g==="th"?"\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35\u0E04\u0E23\u0E31\u0E1A \u0E1C\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E2D\u0E18\u0E34\u0E1A\u0E32\u0E22\u0E1C\u0E25\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14\u0E41\u0E25\u0E30\u0E41\u0E19\u0E30\u0E19\u0E33\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E14\u0E39\u0E41\u0E25\u0E44\u0E14\u0E49":"Hello. I can explain your latest result and suggest next care steps."}]);React.useEffect(()=>{if(!T)return;let E=window.scrollY;return document.documentElement.classList.add("chat-modal-open"),()=>{document.documentElement.classList.remove("chat-modal-open"),window.scrollTo({top:E,behavior:"instant"})}},[T]);let x=async E=>{let R=(E||d).trim();if(!(!R||C)){M(I=>[...I,{role:"user",text:R}]),w(""),_(!0);try{let I=await window.CG.API_CLIENT.chat(R,g);M(N=>[...N,{role:"assistant",text:I.reply,quick:I.quick_replies,source:I.llm_used?`LLM \xB7 ${I.model}`:g==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27":"Verified fallback guidance"}])}catch(I){M(N=>[...N,{role:"assistant",text:I.message||(g==="th"?"\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49":"Assistant unavailable")}])}finally{_(!1)}}};return React.useEffect(()=>{let E=b.current;E&&E.scrollTo({top:E.scrollHeight,behavior:"smooth"})},[y,C]),React.createElement("div",{className:`advice-chat ${T?"open":""}`,onPointerDown:E=>E.stopPropagation(),onClick:E=>E.stopPropagation()},T&&React.createElement("button",{type:"button",className:"advice-chat-backdrop",onClick:()=>m(!1),"aria-label":g==="th"?"\u0E1B\u0E34\u0E14\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22":"Close assistant"}),T&&React.createElement("section",{className:"advice-chat-panel","aria-label":g==="th"?"\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E41\u0E19\u0E30\u0E19\u0E33":"Advice assistant",onClick:E=>E.stopPropagation()},React.createElement("header",null,React.createElement("div",null,React.createElement("b",null,g==="th"?"\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22 CassavaGuard":"CassavaGuard Assistant"),React.createElement("span",null,g==="th"?"\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E1C\u0E25\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14":"Grounded in your latest result")),React.createElement("button",{type:"button",onClick:()=>m(!1),"aria-label":"Close"},React.createElement(n,{name:"close",className:"w-5 h-5"}))),React.createElement("div",{ref:b,className:"advice-chat-messages","aria-live":"polite"},y.map((E,R)=>React.createElement("div",{key:R,className:`chat-message ${E.role}`},React.createElement("p",null,E.text),E.source&&React.createElement("span",{className:"chat-source"},E.source),E.quick&&React.createElement("div",{className:"chat-quick"},E.quick.map(I=>React.createElement("button",{type:"button",key:I,onClick:()=>x(I)},I))))),C&&React.createElement("div",{className:"chat-message assistant"},React.createElement(r,{className:"w-4 h-4"}))),React.createElement("form",{onSubmit:E=>{E.preventDefault(),E.stopPropagation(),x()}},React.createElement("input",{maxLength:"500",value:d,onChange:E=>w(E.target.value),placeholder:g==="th"?"\u0E16\u0E32\u0E21\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E1C\u0E25 \u0E42\u0E23\u0E04 \u0E19\u0E49\u0E33 \u0E1B\u0E38\u0E4B\u0E22 \u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u2026":"Ask about results, disease, water, fertilizer\u2026"}),React.createElement("button",{type:"submit",disabled:C||!d.trim()},React.createElement(n,{name:"play",className:"w-4 h-4"}))),React.createElement("small",null,g==="th"?"\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E31\u0E14\u0E01\u0E23\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E41\u0E17\u0E19\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E25\u0E2B\u0E49\u0E2D\u0E07\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23":"Screening guidance; not a substitute for expert or laboratory confirmation.")),React.createElement("button",{type:"button",className:"advice-chat-fab",onClick:()=>m(E=>!E),"aria-label":g==="th"?"\u0E40\u0E1B\u0E34\u0E14\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E41\u0E19\u0E30\u0E19\u0E33":"Open advice assistant"},React.createElement(n,{name:T?"close":"bulb",className:"w-6 h-6"}),React.createElement("span",null,g==="th"?"\u0E16\u0E32\u0E21\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22":"Ask")))}window.CG.App=u})();(function(){ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(window.CG.Store.Provider,null,React.createElement(window.CG.App)))})();})();
