import * as React from "react";
import axios from "axios";

import { Grid, Button } from "@material-ui/core";
import { Header } from "../components";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";

export default class CreatePlan extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      planName: "",
      start: "",
      end: "",
      gap: "",
      startDate: new Date(),
      endDate: new Date(),
      dates: [],
      key: "selection",
    };
  }

  onRangeChange = (ranges) => {
    //console.log(ranges);
    this.setState({
      startDate: ranges["selection"].startDate,
      endDate: ranges["selection"].endDate,
      key: ranges["selection"].key,
    })
    //getMonth
    let startGetMonth = ranges["selection"].startDate.getMonth();
    startGetMonth = startGetMonth<9?'0'+(startGetMonth+1):startGetMonth+1;
    let endGetMonth = ranges["selection"].endDate.getMonth();
    endGetMonth = endGetMonth<9?'0'+(endGetMonth+1):endGetMonth+1;
    //getDate
    let startGetDate = ranges["selection"].startDate.getDate();
    startGetDate = startGetDate<10?'0'+startGetDate:startGetDate;
    let endGetDate = ranges["selection"].endDate.getDate();
    endGetDate = endGetDate<10?'0'+endGetDate:endGetDate;
    //getYear
    let startGetYear = ranges["selection"].startDate.getFullYear();
    let s_startGetYear = startGetYear.toString();
    let n_startGetYear = parseInt(s_startGetYear);
    let endGetYear = ranges["selection"].endDate.getFullYear();
    let s_endGetYear = endGetYear.toString();
    let n_endGetYear = parseInt(s_endGetYear);
    this.setState({
      dates: [n_startGetYear+"-"+startGetMonth+"-"+startGetDate, n_endGetYear+"-"+startGetMonth+"-"+endGetDate]
    })
  };

  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitHandler = (e) => {
    e.preventDefault();
    console.log(this.state);
    
    const headers = {
      'Access-Control-Allow-Origin': '*',      
      'Content-Type': 'aapplication/json'
    }

    const datas = {
      title: this.state.planName,
      start: this.state.start,
      end: this.state.end,
      gap: this.state.gap,
      dates: this.state.dates
    }

    axios
      .post('https://letsmeeet.azurewebsites.net/api/meet', datas, headers, { withCredentials: true })
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

  render() {

    const { planName, start, end, gap } = this.state;

    //시간 배열
    const Times = new Array();
    for (let i = 1; i < 12; i++) {
      Times.push(i);
    }
    //수정 전 -> {`"${amTime}:00"`}, {`"${pmTime + 12}:00"`}
    const amTimeList = Times.map((amTime) => (
      <option value={`${amTime}:00`}>오전{amTime}시</option>
    ));
    const pmTimeList = Times.map((pmTime) => (
      <option value={`${pmTime + 12}:00`}>오후{pmTime}시</option>
    ));

    return (
      <Grid className="create-cont">
        <form onSubmit={this.submitHandler}>
          <Header />
          <Grid className="create-cont-title">
            <h2>언제가 좋을까요?🤔</h2>
          </Grid>
          <Grid className="setting">
            {/* 캘린더 */}
            <DateRange
              className="create-calendar"
              editableDateInputs={true}
              onChange={this.onRangeChange}
              moveRangeOnFirstSelection={false}
              ranges={[this.state]}
            />
            <Grid className="create-cont-setting2">
              {/* 일정이름 */}
              <input
                className="create-name"
                type="text"
                name="planName"
                value={planName}
                onChange={this.changeHandler}
                placeholder="일정 이름을 작성해주세요."
              />
              {/* 시간 정하기 */}
              <Grid className="create-time">
                <FormControl className="create-time-start">
                  {/* <InputLabel className="timeText">Start Time</InputLabel> */}
                  <NativeSelect
                    id="start"
                    name="start"
                    value={start}
                    onChange={this.changeHandler}
                  >
                    <option aria-label="None" value="">
                      시작시간
                    </option>
                    {/*수정 전 -> value='"00:00"'*/}
                    <option value='00:00'>오전0시</option>
                    {amTimeList}
                    {pmTimeList}
                  </NativeSelect>
                </FormControl>
                <Grid>~</Grid>
                <FormControl className="create-time-finish">
                  {/* <InputLabel className="timeText">Finish Time</InputLabel> */}
                  <NativeSelect
                    id="end"
                    name="end"
                    value={end}
                    onChange={this.changeHandler}
                  >
                    <option aria-label="None" value="">
                      끝시간
                    </option>
                    {amTimeList}
                    {/*수정 전 -> value='"12:00"'*/}
                    <option value='12:00'>오후12시</option>
                    {pmTimeList}
                  </NativeSelect>
                </FormControl>
              </Grid>
              <Grid className="create-gap">
                <FormControl>
                  {/* <InputLabel className="timeText">Interval</InputLabel> */}
                  <NativeSelect
                    id="gap"
                    name="gap"
                    value={gap}
                    onChange={this.changeHandler}
                  >
                    <option aria-label="None" value="">
                      단위
                    </option>
                    <option value={15}>15분</option>
                    <option value={30}>30분</option>
                    <option value={60}>1시간</option>
                  </NativeSelect>
                </FormControl>
                <Grid>&nbsp;&nbsp;단위</Grid>
              </Grid>
              {/* 일정생성 버튼 */}
              <Grid className="create-plan">
                <Button type="submit" className="create-plan-btn">
                  일정 생성하기
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Grid>
    );
  }
}
