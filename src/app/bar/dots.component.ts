import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'app-bar',
  templateUrl: './dots.component.html',
  styleUrls: ['./dots.component.css']
})
export class DotsComponent implements OnInit {
  w = 800;
  h = 600;
  data: any;
  constructor(private dataService: DataService) { }
  ngOnInit() {
    this.getDataFromAPI()
      .then(() => this.draw())
      .catch(error => console.error('Error:', error));
  }
  draw(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.drawChart();
      resolve(); // Opcionalmente, puedes pasar algún valor a resolve()
    });
  }
  private drawChart(): void {
    // Datos de ejemplo

    const data1: any = this.data;

    // Configuración del gráfico
    const margin = { top: 60, right: 20, bottom: 60, left: 80 };
    const width = this.w - margin.left - margin.right;
    const height = this.h - margin.top - margin.bottom;

    data1.map((d: any) => (
      d.myYear = new Date(d.Year, 1),
      d.myMinute = this.setMinutes(d.Seconds)
    ))
    console.log(data1);

    //Get the range we want to display on X axis
    
    var maxX = new Date (d3.max(data1, (d: any) => d.myYear)) 
    var minX = new Date (d3.min(data1, (d: any) => d.myYear)) 
    var maxY = new Date (d3.max(data1, (d: any) => d.myMinute))
    var minY = new Date (d3.min(data1, (d: any) => d.myMinute))

    const toolTips = d3.select("body").append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("background", "Red")
      .style("color", "White")
      .style("opacity", 0);

    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const chartTitle = svg.append('text')
      .attr('class', 'chart-title')
      .style('font-family', 'Arial')
      .style('font-size', '26px')
      .attr('id', 'title')
      .attr('x', width / 2)
      .attr('y', - margin.top / 2)
      .style('text-anchor', 'middle')
      .text('Doping in Professional Bicycle Racing')

    const chartSubTitle = svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20 - margin.top / 2)
      .attr('text-anchor', 'middle')
      .text("35 Fastest times up Alpe d'Huez")
      .style('font-size', '16px')

    // Escala X
    const xScale = d3.scaleUtc()
      .domain([minX, maxX])
      .range([0, width]);

    // Escala Y
    const yScale = d3.scaleUtc()
      .domain([maxY, minY])
      .range([height, 0]);

    // Crear las barras del gráfico

    svg.selectAll('circle')
      .data(data1)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('data-xvalue', (d: any) => d.myYear)
      .attr('data-yvalue', (d: any) => d.myMinute)
      .attr('cx', (d: any) => xScale(d.myYear))
      .attr('cy', (d: any) => yScale(d.myMinute))
      .attr('r', 5)
      .attr('stroke', 'brown')        // Color del borde
      .attr('stroke-width', 1)
      .style('fill', (d: any) => (d.Doping ? 'red' : 'green'))
      .on('mouseover', (event, d: any) => {
        d3.select('#tooltip')
          .attr("data-year", d.myYear)
          .style('display', 'block')
          .style('left', (event.clientX + 10) + 'px')
          .style('top', (event.clientY - 10) + 'px')
          .html(d.Name + ": " + d.Nationality + "<br> Year: " + d.Year + " Time: " + d.Time + " <br> " + d.Doping);
      })
      .on('mouseout', () => {
        d3.select('#tooltip')
          .style('display', 'none');
      })
      .style("opacity", .8);

    const xAxisTitle = svg.append('text')
      .attr('id', 'x-axis-title')
      .style('font-family', 'Arial')
      .style('font-size', '16px')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .style('text-anchor', 'middle')
      .style('font-size', '18px')
      .text('Years');

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    const yAxisTitle = svg.append('text')
      .attr('id', 'y-axis-title')
      .style('font-family', 'Arial')
      .style('font-size', '16px')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 30)
      .style('text-anchor', 'middle')
      .style('font-size', '18px')
      .text('Time in Minutes');

    var yAxis = d3.axisLeft(yScale);
      svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("id", "y-axis")
      .call(yAxis
        .tickFormat(d3.utcFormat('%M:%S'))		//Specify showing of time as Minute:Seconds
        .tickPadding(10)
      );

    var legend = svg.selectAll(".legend")
    .data(data1)
		.enter().append("g")
		.attr("class", "legend")
		.attr("id", "legend");

    legend.append("circle")
      .attr("stroke", "brown")
      .attr("stroke-width", 1)
      .attr("cx", 500)
      .attr("cy", 200)
      .attr("r", 5)
      .attr("fill", "green");
      
  legend.append("circle")
      .attr("stroke", "brown")
      .attr("stroke-width", 1)
      .attr("cx", 500)
      .attr("cy", 220)
      .attr("r", 5)
      .attr("fill", "red");	

  //Add text to legend
  legend.append("text")
    .attr("x", 510)
    .attr("y", 205)
    .text("No Doping Allegations");
    
  legend.append("text")
    .attr("x", 510)
    .attr("y", 225)
    .text("Riders With Doping Allegations");		

  }
  getDataFromAPI(): Promise<any> {
    return new Promise<void>(async (resolve, reject) => {
      this.data = await this.dataService.getData().toPromise();
      resolve(); // Opcionalmente, puedes pasar algún valor a resolve()
    });
  }

  setMinutes(seconds){
    var minute;
        minute = new Date();
        minute.setMinutes(seconds / 60);
        minute.setSeconds(seconds % 60);
        return minute;
  }
}

