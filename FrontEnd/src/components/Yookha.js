import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@material-ui/core';
const Yookha=({url})=> {
    const [yookha, setyookha] = useState({
        who: '',
        when: '',
        where: '',
        what: '',
        how: '',
        why: '',
      });
      const { who, when, where, what, how, why } = yookha;

    const onChange = (e) => {
        const { value, name } = e.target;
        setyookha({
      ...yookha,
      [name]: value
    });
      };

      const handlesubmit = (e) => {
        e.preventDefault();
        //console.log(text);
        const headers = {
          'Access-Control-Allow-Origin': '*',        
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      
        const data = {
          "who": who,
          "when": when,
          "where": where,
          "why": why,
          "how": how,
          "what": what,
        }
      
        axios
          .post('https://letsmeeet.azurewebsites.net/api/meet/sub', data, headers, { withCredentials: true })
          .then(function (response) {
          console.log(response);
          })
          .catch(function (error) {
          console.log(error);
          const status = error?.response?.status;
          if (status === undefined) {
            console.dir(
            "데이터를 불러오던 중 예기치 못한 예외가 발생하였습니다.\n" +
              JSON.stringify(error)
            );
          } else if (status === 400) {
            console.dir("400에러");
          } else if (status === 500) {
            console.dir("내부 서버 오류입니다. 잠시만 기다려주세요.");
          }
          });
        };
  return (
    <div className="yook-ha">
    <text className="title">육하원칙 <img className="img" alt='hand' src="/img/hand.png"></img> </text>
    <span className="midbtn">
         <Button variant="contained" color="primary"onClick={handlesubmit} >저장</Button>
    </span>
    <div className="flex-container">
    <div className="inputbox">
    <text className="subtitle">누구랑?</text>
    <input className="input" name="who" placeholder="?누구랑" dir="rtl" onChange={onChange} value={who} />
    <hr color="lightblue" size="3px" align="left"></hr>
    </div>
    
    <div className="inputbox">
    <text className="subtitle">언제?</text>
    <input className="input" name="when" placeholder="?언제" dir="rtl" onChange={onChange} value={when} />
    <hr color="lightblue" size="3px" align="left"></hr>
    </div>
    

    <div className="inputbox">
    <text className="subtitle">어디서?</text>
    <input className="input" name="where" placeholder="?어디서" dir="rtl" onChange={onChange} value={where} />
    <hr color="lightblue" size="3px" align="left"></hr>
    </div>

    <div className="inputbox">
    <text className="subtitle">무엇을?</text>
    <input className="input" name="what" placeholder="?무엇을" dir="rtl" onChange={onChange} value={what} />
    <hr color="lightblue" size="3px" align="left"></hr>
    </div>

    <div className="inputbox">
    <text className="subtitle">어떻게?</text>
    <input className="input" name="how" placeholder="?어떻게" dir="rtl" onChange={onChange} value={how} />
    <hr color="lightblue" size="3px" align="left"></hr>
    </div>

    <div className="inputbox">
    <text className="subtitle">왜?</text>
    <input className="input" name="why" placeholder="?왜" dir="rtl" onChange={onChange} value={why} />
    <hr color="lightblue" size="3px" align="left"></hr>
    </div>
    </div>
    </div>
    
  );
}

export default Yookha;

//input --> float:right