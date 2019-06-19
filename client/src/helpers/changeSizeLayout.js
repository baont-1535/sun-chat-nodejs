'use strict';

import config from "../config/listRoom";
import {MIN_WIDTH, MIN_WIDTH_DESC_CONTAINER, MIN_WIDTH_OTHER_CONTAINERS} from "../config/room";

export default class changeSizeLayout {

  clicked = null;
  onRightEdge = false;
  container = null;
  pointerToEdge = 0;
  redraw = false;
  MARGINS = 4;
  extraContainer;
  desContainer;
  isSideBar;
  desW = 0;
  widthContainer = 0;
  widthRightEdge = 0;

  constructor(container, extraContainer = '', desContainer = '', isSideBar = false) {
    this.container = document.getElementsByClassName(container)[0];
    this.extraContainer = extraContainer;
    this.desContainer = desContainer;
    this.isSideBar = isSideBar;

    if (this.container) {
      this.container.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('mousemove', this.onMove);
      document.addEventListener('mouseup', this.onMouseUp);
      this.animate();
    }
  }

  onMouseDown = (e) => {
    this.widthContainer = this.container.offsetWidth;
    this.widthRightEdge = this.extraContainer.offsetWidth;

    this.detect(e);

    this.clicked = {
      onRightEdge: this.onRightEdge,
    };

    e.preventDefault();
  }

  detect(e) {
    let b = this.container.getBoundingClientRect();
    this.pointerToEdge = e.clientX - b.left;
    let realWidth = b.width - this.MARGINS;
    this.onRightEdge = this.pointerToEdge >= realWidth;
  }

  onMove = (e) => {
    this.detect(e);
    this.redraw = true;
  }

  onMouseUp = (e) => {
    this.clicked = null;
    this.detect(e);
    this.desW = 0;
  }

  exeSidebar = () => {
    let minW = config.MIN_WIDTH * window.innerWidth / 100;
    let maxW = config.MAX_WIDTH * window.innerWidth / 100;
    let chatRoom = document.getElementsByClassName(this.extraContainer)[0];
    let des = document.getElementsByClassName(this.desContainer)[0];
    this.desW = this.desW ?  this.desW : des.offsetWidth;

    chatRoom.style.setProperty('margin-right', this.desW + 'px', 'important');
    des.style.setProperty('margin-left', - this.desW + 'px', 'important');

    if (this.pointerToEdge > maxW) {
      this.container.style.setProperty('width', maxW + 'px', 'important');
    } else if (this.pointerToEdge < minW) {
      this.container.style.setProperty('width', minW + 'px', 'important');
    } else {
      chatRoom.style.setProperty('width', '-webkit-fill-available', 'important');
      this.container.style.setProperty('width', this.pointerToEdge + 'px', 'important');
    }
  }

  exeChatRoom = () => {
    let minW = MIN_WIDTH * window.innerWidth / 100;
    let minWidthDes = MIN_WIDTH_DESC_CONTAINER * window.innerWidth / 100;
    let sideBar = document.getElementsByClassName(this.extraContainer)[0];

    if (minWidthDes < window.innerWidth - sideBar.offsetWidth - this.pointerToEdge) {
      this.container.style.setProperty('width', Math.max(this.pointerToEdge, minW) + 'px', 'important');
    }
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    if (!this.redraw) return;

    this.redraw = false;

    if (this.clicked) {
      if (this.clicked.onRightEdge) {
        if (this.isSideBar) {
          this.exeSidebar();
        } else {
          this.exeChatRoom();
        }
      }

      return;
    }

    if (this.onRightEdge) {
      this.container.style.cursor = 'ew-resize';
    } else {
      this.container.style.cursor = 'default';
    }
  }
}
