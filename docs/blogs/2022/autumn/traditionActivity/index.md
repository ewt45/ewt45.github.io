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
### 在activity里显示fragment
- 自己继承写一个类继承android.app.Acitivity
- 对fragment的添加，删除通过fragmentManager进行，通过activity.getFragmentManager()获取。
```java
FragmentMini fragmentMini = new FragmentMini();
activity.getFragmentManager().beginTransaction()
    .add(AssistR.fragment_root_activity_view, fragmentMini, "FragmentMini").hide(fragmentMini)
    // .add....
    .show(fragmentMini)
    .addToBackStack(null).commit();
```
- AssistR.fragment_root_activity_view是acitivity的根布局的资源id


## 使用FragmentManager对多个Fragment进行切换显示
- 管理器有个beginTransaction()开始事务的方法，链式操作，用于添加，隐藏，显示碎片，并且还可以记录当前栈情况以便回滚。
    - 事务只有调用了comimt()方法才会真正执行前面的操作。
    - 在一条事务操作的最后，commit之前加上addToBackStack(null)记录当前栈情况，这样调用popBackStack()时本次事务的操作会被取消，比如在事务中进行了add()添加一个碎片，那么调用pop之后这个碎片就会移除。\
    add的传参最好传null，否则pop可能不生效。
    - 介绍一些事务可以调用的方法:\
    add()添加一个碎片，碎片生命周期开始
    remove()删除一个碎片，碎片生命周期结束
    replace() 将当前activity显示的碎片替换为某个碎片，相当于remove+add
    hide() 隐藏碎片，但是碎片并没有被销毁
    show() 显示碎片

- 如果想进行两个碎片之间的切换，可以用hide()和show。replace由于会删除原先的fragment，所以不利于返回时回到原先fragment（如果没这个需求那无所谓）。使用hide和show要先保证碎片被add添加，可以在activity初始化时将全部碎片初始化并add，也可以在需要进入对应fragment之前再新建对象并add。如果fragment较多，那么activity初始化可能要耗费较长时间而且fragment一直存在也占内存。
### 在活动初始化时add全部碎片
```java
//activity中
//一次性添加全部fragment，感觉相当于fragmentPagerAdapter了
FragmentMini fragmentMini = new FragmentMini();

FragmentDetail fragmentDetail = new FragmentDetail();
FragmentDetailBackup fragmentDetailBackup = new FragmentDetailBackup();
FragmentDetailInfo fragmentDetailInfo = new FragmentDetailInfo();
//add第一个是fragment要添加到的父容器的id，第二个是fragment，第三个是fragment的标签
//添加addToBackStack，这样按返回键可以关闭此fragment
activity.getFragmentManager().beginTransaction()
    .add(AssistR.fragment_root_activity_view, fragmentMini, "FragmentMini").hide(fragmentMini)
    .add(AssistR.fragment_root_activity_view, fragmentDetail, "FragmentDetail").hide(fragmentDetail)
    .add(AssistR.fragment_root_activity_view, fragmentDetailBackup, "FragmentDetailBackup").hide(fragmentDetailBackup)
    .add(AssistR.fragment_root_activity_view, fragmentDetailInfo, "FragmentDetailInfo").hide(fragmentDetailInfo)
    .show(fragmentMini)
    .addToBackStack(null).commit();
```
### 在需要进入下一个碎片的时候调用hide和show
一般是按钮之类的调用。
```java
//fragment中
FragmentManager manager = FragmentMini.this.getActivity().getFragmentManager();

manager.beginTransaction()
    .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
    .hide(manager.findFragmentByTag("FragmentMini"))
    .show(manager.findFragmentByTag("FragmentDetail"))
    .addToBackStack(null).commit();
```
- setTransition是添加过渡动画。
- hide隐藏当前碎片，show显示当前碎片。
- hide和show需要传入fragment对象，获取对象的方式我采用的是通过管理器寻找对应tag，这个tag是在add对应碎片时传入的第三个参数（可以看上面）。
- 同样在commit之前调用addtobackstack，以便之后可以返回到当前碎片。
    
### 在需要返回到上一个碎片时调用popBackStack
```java
//fragment中
getActivity().getFragmentManager().popBackStack();
```
返回到上一个记录栈，上一个记录栈是隐藏碎片a，显示碎片b，那么就会反过来显示碎片a，隐藏碎片b，达到退回上一个fragment的目的。
