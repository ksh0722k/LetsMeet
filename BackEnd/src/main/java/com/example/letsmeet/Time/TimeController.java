package com.example.letsmeet.Time;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Stack;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.letsmeet.Meet.Meet;
import com.example.letsmeet.User.User;

@RestController
@RequestMapping("/api/time")
public class TimeController {

	@Resource
	private UserInfo userInfo;
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	@PutMapping
	public ResponseEntity<?> myTime(@RequestBody MyTime myTime) {
		
		System.out.println(myTime.toString());
		
		User user = User.getUser(mongoTemplate, myTime.getUserId(), myTime.getMeetId());
		System.out.println(user);
		Meet meet = User.getMeet(mongoTemplate, myTime.getMeetId());
		
		
		
		
		
		int col = myTime.getCheckArray().length;
		
		
		if(meet.getCheckArray().length != col) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		int row = meet.getDates().size();
		int[] checkArray = myTime.getCheckArray();
		int[][] times = new int[col][row];
		
		
		for(int i=0; i<col; i++) {
			int value = checkArray[i];
			String stringBinary = String.format("%0" + row + "d", Integer.parseInt(Integer.toBinaryString(value).toString()));
			for(int j=0; j<row; j++) {
				times[i][j] = stringBinary.charAt(j) - '0';
				
			}
			
		}
		
		
		Query query = new Query();
		query.addCriteria(Criteria.where("_id").is(user.getUserKey()));
		User queryUser = mongoTemplate.findOne(query, User.class);
		
		Update update = new Update();
		update.set("userTimes", times);
		
		HttpStatus status;
		
		if(userTimeChanged(queryUser.getUserTimes(),times)) {
			mongoTemplate.updateFirst(query, update, "user");
			status = HttpStatus.CREATED;
		}else {
			status = HttpStatus.OK;
		}
		
		return new ResponseEntity<Meet>(updateTotalTable(meet), status);

		
	}

	@GetMapping
	@ResponseBody
	public Map possibleTime() {
		
		Map possibleTimeInfo = new HashMap<String, Object>();
		Meet meet = userInfo.getUser().getMeet(mongoTemplate, userInfo.getUser().getMeetId());
		

		

		String start = meet.getStart().split(":")[0];
		String end = meet.getEnd().split(":")[0];
		int startTime = Integer.parseInt(start);
		int endTime = Integer.parseInt(end);


		possibleTimeInfo.put("startTime", startTime);
		possibleTimeInfo.put("endTime", endTime);
		
		LocalDate startDate = meet.getDates().get(0);
		int length = meet.getDates().size();
		LocalDate endDate = meet.getDates().get(length - 1);
		
		possibleTimeInfo.put("startDate", startDate);
		possibleTimeInfo.put("endDate", endDate);
		
		ArrayList<LocalDate> dates = meet.getDates();
		List<String> days = new ArrayList<String>();
		
		for(LocalDate date : dates) {
			days.add(date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.KOREAN));
		}
		
		possibleTimeInfo.put("days", days);
		
		
		return possibleTimeInfo;
	}
	
	@DeleteMapping
	public ResponseEntity<?> deleteMyTime() {
		
		User user = userInfo.getUser();
		
		if( user == null ) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		Meet myMeet = User.getMeet(mongoTemplate, user.getMeetId());
		
		int col = myMeet.getCheckArray().length;
		int row = myMeet.getDates().size();
		
		int[][] reset = new int[col][row];
		
		
		user.setUserTimes(reset);
		
		Query query = new Query();
		query.addCriteria(Criteria.where("_id").is(user.getUserKey()));
		mongoTemplate.findAndReplace(query, user);
		
		updateTotalTable(myMeet);
		
		return ResponseEntity.ok().build();
		
	}
	
	
	public boolean userTimeChanged(int[][] before, int[][] after) {
		
		
		
		int col = before.length;
		int row = before[0].length;
		
		for(int i =0; i< col; i++) {
			
			for(int j = 0; j < row; j++) {
				
	
				if (before[i][j] != after[i][j]) {
					return true;
				}
			}
			
			
		}
		
		return false;
	}
	public Meet updateTotalTable(Meet meet) {
		//한 약속에 참여한 사용자들의 공동 시간표를 업데이트 하는 메소드. 
		
		ArrayList<User> users = new ArrayList<User>();

		

		int col = Integer.parseInt(meet.getEnd().split(":")[0]) - Integer.parseInt(meet.getStart().split(":")[0]);		

		col = (int)(60 / meet.getGap()) * col;
		int row = meet.getDates().size();
		int[] totalTable = new int[col];
		int num = meet.getNum();
		int notation = num+1;
		int[][] checkUsers = new int[col][row];

		
		
		//checkArray : 단순히 해당 시간대에 몇 명이 가능한지 표현함. 1차원 배열
		//1. 사용자들의 timetable 정보를 불러온다. 
		Query query = new Query();
		query.addCriteria(Criteria.where("meetId").is(meet.getMeetId()));
		users = (ArrayList<User>)mongoTemplate.find(query, User.class); //순서 중요. 
		
		
		//2. 2차원 배열을 돌면서 계산한다. 
		
			
		for(int i=0; i<col; i++) {
			
			int[] value = transferToN(totalTable[i], notation, row);
			
			
			
			for(int j=0; j<row; j++) {
				
				String check = new String();
				
				for(User user : users) {
					
					int[][] userTime = user.getUserTimes();
					int timeValue = userTime[i][j];
					
					if (timeValue != 0) {
						
						value[j] += 1;
						
						check += '1';
					}else{
						
						check += '0';
					}
					
					
				}
				
				
				int checkUser = Integer.parseInt(check, 2);
				checkUsers[i][j] = checkUser;
				
				
				
				
			}
			
			
			
			
			
			//한줄 계산 다 끝남. 
		
			int updated = 0;
			
			
			for(int j=0; j<row; j++) {
				
				updated += Math.pow(notation, row-j-1)*(value[j]);

				
				
			}
			
			
			totalTable[i] = updated;
			
			
			
			
		}
		
		Update update = new Update();
		update.set("checkArray", totalTable);
		update.set("checkUser", checkUsers);
		FindAndModifyOptions option = new FindAndModifyOptions();
		option.returnNew(true);
		//System.out.println(mongoTemplate.updateFirst(query, update, "meet").toString());
		return (Meet)mongoTemplate.findAndModify(query, update, option, Meet.class, "meet");
		
		//3. N진법으로 표현한다. 여기서 N은 멤버수. 
		
		
		
		//checUser : 어떤 시간대에 어떤 유저들이 가능한지 표현함. 2차원 배열. 
		
		
		
	}
	
	public String test(int value, int n , int row) {
		
		String result = new String();
		int quota = value;
		int rem = 0;
		
		if (n == 1) n = 2;
		
		while(quota != 0) {
			rem = quota % n;
			quota = (int) quota / n;
			result += Integer.toString(rem);
		}
		
		result = new StringBuffer(result).reverse().toString();
		
		
		
		
		return result;
	}
	
	public int[] transferToN(int value, int n, int row) {
		//자연수를 n진수로 변환하는 메소드.
		
		int quota = value;
		int rem = 0; 
		
		if (n == 1 ) {
			n = 2;
		}
		
		Stack<Integer> stack = new Stack<>();
		int[] result = new int[row];
		
		while (quota != 0) {
			
			rem = quota % n;
			quota = (int)quota / n;
			
			stack.add(rem);
			
		}
		
		
			
			
		for(int i=0; i<row; i++) {
			
			if(!stack.empty()) {
				
				result[i] = stack.pop();
			}else {
				result[i]= 0;
			}
			
		}
		
		
		
		
		
		return result;
	}
	
}
