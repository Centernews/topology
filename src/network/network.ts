/**
 * @license
 * Copyright Cisco Inc. All Rights Reserved.
 *
 * Author: gsp-dalian-ued@cisco.com
 */

import * as _ from 'lodash';
import * as PIXI from 'pixi.js';
import { Application } from './application';
import { CommonAction } from './common-action';
import { Drawer } from './drawer';
import { Edge } from './edge';
import { Group } from './group';
import { Node } from './node';
import { Tooltip } from './tooltip';

import { Topo } from './topo';

export class Network {
  private loader = PIXI.loader;
  private topo: Topo;
  private drawer: Drawer;
  private app: Application;
  private action: CommonAction;
  private tooltip: Tooltip;

  constructor(domRegex: string) {
    this.topo = new Topo(this.loader);
    this.drawer = new Drawer(domRegex, this.topo);
    this.app = this.drawer.getWhiteBoard();
    this.tooltip = new Tooltip();
    this.action = new CommonAction(this.app, this.topo, this.tooltip);
  }

  public addResourceCache(key: string, image: string) {
    this.loader.add(key, image);
    return this.loader;
  }

  public createNode(resourceName?: string) {
    return this.topo.createNode(resourceName);
  }

  public createGroup() {
    return this.topo.createGroup();
  }

  public createEdge(startNode: Node | Group, endNode: Node | Group) {
    return this.topo.createEdge(startNode, endNode);
  }

  public createLabel(text?: string, style?: PIXI.TextStyleOptions, canvas?: HTMLCanvasElement) {
    return this.topo.createLabel(text, style, canvas);
  }

  public clear() {
    const elements = this.topo.getElements();
    _.each(elements, (element) => {
      element.destroy();
    });
    _.remove(elements, undefined);
  }

  public getElements() {
    return this.topo.getElements();
  }

  public addElement(element: Node | Group | Edge) {
    this.topo.addElement(element);
  }

  public addElements(elements: Node[] | Group[] | Edge[]) {
    this.topo.addElements(elements);
  }

  public removeElements(element: PIXI.Container) {
    const elements = this.topo.getElements();
    _.remove(elements, elem => element === elem);
    if (element instanceof Edge) {
      const edgesGroupByNodesUID = this.topo.getEdgesGroup();
      const uidStr = element.edgeNodesSortUIDStr();
      const edge = _.get(edgesGroupByNodesUID, uidStr);
      edge[0].removeBrotherEdge(element);
    }
    element.destroy();
  }

  public setDrag() {
    this.action.dragContainer();
  }

  public setSelect() {
    this.action.setSelect();
  }

  public setZoom(num: number) {
    this.action.setZoom(num);
  }

  public zoomOver() {
    this.action.zoomOver();
  }

  public zoomReset() {
    this.action.zoomReset();
  }

  public syncView() {
    this.drawer.syncView();
    this.setClick();
  }

  public setClick(color?: any) {
    this.action.setClick(color);
  }

  public addTooltip(element: any, content?: string) {
    this.tooltip.addTooltip(element, content);
  }

  public setTooltipDisplay(isDisplay: any) {
    this.tooltip.setTooltipDisplay(isDisplay);
  }

  public setBundle(edge: any) {
    this.action.setBundle(edge);
  }

  public bundleLabelToggle() {
    this.action.bundleLabelToggle();
  }

  public nodeLabelToggle() {
    this.action.nodeLabelToggle();
  }

}
