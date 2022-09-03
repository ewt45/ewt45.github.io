---
date: '2022-09-02 11:15'
title: 安卓android.app.Fragment 旧版Fragment的使用，多Fragment切换
categories: 
 - 技术
tags:
 - android
 - Acitivity
 - Fragment
---

## 前言
android.app包下的这个旧Fragment类已经被官方不建议使用了，建议使用androidx包下的那个Fragment类，支持更低版本的安卓而且持续更新。\
那么为什么我还要用这个又老又不好用的老F呢，因为起因是想给pvz free写悬浮窗，然后发现这应用的Activity用的是老版的Activity，而想用新版F的条件就是应用的Activity继承的必须是新的androidx包里的FragmentActivity，所以用不成=-=

## Fragment基础创建与使用
### 创建自己的Fragment类
```
public class FragmentMini extends Fragment  {

    private String TAG = "FragmentMini";
    private View rootView;

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        //当attachToRoot为false，container用于为返回的视图提供layoutparams
        rootView = inflater.inflate(AssistR.LAYOUTID_assist_mini, container, false);

        return rootView;
    }
}
```
- 写一个类，继承Fragment，注意选择android.app.Fragment。
- 重写onCreateView，通过inflater查找想要的视图，并返回，这个视图就作为此Fragment显示在屏幕时的布局。
    - inflate()第三个参数传false，否则报错`	Caused by: java.lang.IllegalStateException: The specified child already has a parent. You must call removeView() on the child's parent first.`
    - 当第三个参数为false时，第二个参数仅用作为视图提供LayoutParams


## 使用FragmentManager对多个Fragment进行切换显示

## 总结