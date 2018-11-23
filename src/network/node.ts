/**
 * @license
 * Copyright Cisco Inc. All Rights Reserved.
 *
 * Author: gsp-dalian-ued@cisco.com
 */

import * as _ from 'lodash';
import { CommonElement, IStyles } from './common-element';
import { Edge } from './edge';
import { EdgeBundle } from './edge-bundle';
import { Group } from './group';

export class Node extends CommonElement {
  private parentNode: Group | null = null;
  private dragging: boolean;
  private data: any;
  private edgesGroupByNodes: { [key: string]: Edge[] };
  private elements: Edge | CommonElement[];
  private selectedNodes: any [] = [];

  constructor(
    edgesGroupByNodes: { [key: string]: Edge[] },
    elements: Edge | CommonElement[],
    selectedNodes: any [] = [],
    resourceName?: string) {
    super();
    this.edgesGroupByNodes = edgesGroupByNodes;
    this.data = null;
    this.dragging = false;
    this.elements = elements;
    this.selectedNodes = selectedNodes;
    // this.draw();  // 圆点
    this.createSprite(resourceName || 'switch');  // 从loader中加载icon, 默认switch
  }

  public setParentNode(node: Group) {
    this.parentNode = node;
  }

  public getChildNode() {
    return this.children[0];
  }

  public getParentNode() {
    return this.parentNode;
  }

  public draw() {
    this.clearDisplayObjects();
    const style = this.defaultStyle;
    const graph = new PIXI.Graphics();
    graph.lineStyle(style.lineWidth, style.lineColor);
    graph.beginFill(style.fillColor, style.fillOpacity);
    graph.drawCircle(0, 0, 5);
    graph.endFill();
    graph.interactive = true;
    graph.buttonMode = true;
    graph
      .on('mousedown', this.onDragStart.bind(this))
      .on('mouseup', this.onDragEnd.bind(this))
      .on('mouseupoutside', this.onDragEnd.bind(this))
      .on('mousemove', this.onDragMove.bind(this));
    this.addChild(graph);
  }

  public onDragStart(event: PIXI.interaction.InteractionEvent) {
    this.dragging = true;
    this.data = event.data;
  }

  public onDragEnd() {
    this.dragging = false;
    this.data = null;
  }

  public onDragMove() {
    if (this.dragging) {
      const newPosition = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      this.redrawEdge();
    }
  }

  public redrawEdge() {
    _.each(this.elements, (element: any) => {
      const groupEdges = element.groupEdges;
      const isExpanded = element.isExpanded;
      // when the group is Expanded redraw it
      if (element instanceof Node && element.parent instanceof Group) {
        if (element.parent.isExpanded) {
          element.parent.draw();
        }
      }
      // when the groip is close on redraw groupEdges
      if (element instanceof Group && !isExpanded) {
        element.rmElements(groupEdges);
        element.drawEdges();
      }
    });
    // redraw all of the EdgeBundle
    _.each(this.edgesGroupByNodes, (edgesGroup, key) => {
      if (_.includes(key, this.getUID())) {
        _.each(edgesGroup, (edge: Edge) => {
          edge.draw();
        });
      }
    });
  }

  public createSprite(resourceName: string) {
    let nodeSprite: PIXI.Sprite = new PIXI.Sprite();
    const loader = PIXI.loader;
    loader
      .load((load: any, resources: any) => {
        const resource = resources[resourceName];
        if (resource) {
          nodeSprite = new PIXI.Sprite(resource.texture);
        } else {
          nodeSprite = new PIXI.Sprite(resources.switch.texture);
        }

      }).onComplete.add(() => {
        const node = nodeSprite;
        node.width = 40;
        node.height = 40;
        node.anchor.set(0.5, 0.5);
        node.interactive = true;
        node.buttonMode = true;
        node
          .on('mousedown', this.onDragStart.bind(this))
          .on('mouseup', this.onDragEnd.bind(this))
          .on('mouseupoutside', this.onDragEnd.bind(this))
          .on('mousemove', this.onDragMove.bind(this));
        this.addChild(node);
      });
  }

  public getWidth() {
    return this.defaultStyle.width;
  }

  public getHeight() {
    return this.defaultStyle.height;
  }

  /**
   * 显示tooltip
   * @param event 事件保留参数
   * @param content tooltip内容
   * @param textStyle tooltip文字样式
   * @param shape tooltip背景形状
   */
  public tooltipOn(event: any, content?: string, textStyle?: any, shape?: string) {

    const tooltipShape = shape || 'rect-sm';  // pic resource of shape
    const tooltipContent = content || this.getUID();  // content
    const tooltipStyle = textStyle || {
      fontSize: 12,
      fill: '0xffffff',
      fontWeight: 'bold',
    };  // styles

    const tooltip = PIXI.Sprite.fromImage(`../pic/${tooltipShape}.png`);  // tooltip main
    tooltip.y = 20;
    tooltip.name = 'nodeTooltip';
    const text = new PIXI.Text(tooltipContent, tooltipStyle);
    text.x = 8;
    text.y = 2;
    tooltip.addChild(text);
    this.addChild(tooltip);
  }

  public tooltipOff() {
    this.removeChild(this.getChildByName('nodeTooltip'));
  }

  public selectOne(color?: any) {
    _.each(this.elements, (element: any) => {
      if (element instanceof Node) {
        element.clearDisplayObjects();
      }
    });
    this.selectOn(color);
  }

  public selectOn(color?: any) {
    this.clearDisplayObjects();
    const border = new PIXI.Graphics();
    border.lineStyle(1, color || 0X024997, 1);
    border.drawRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 10);
    border.name = 'node_border';
    this.addChild(border);
  }
}
